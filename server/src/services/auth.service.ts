import jwt from "jsonwebtoken";
import { config } from "../config/configuration";
import {
	IUser,
	IInfluencer,
	AuthServiceResponse,
	IBrand,
	IAdmin,
} from "../types";
import validator from "validator";
import { HttpError, Conflict, ResourceNotFound } from "../middleware/errors";
import { hash_password, compare_password } from "../utils/auth_password";
import { User } from "../models/users.models";
import { Influencer } from "../models/influencers.models";
import { Brand } from "../models/brands.models";
import { Admin } from "../models/admin.models";
import {
	influencerRegisterSchema,
	brandRegisterSchema,
	adminRegisterSchema,
} from "../schema/auth.schema";
import { UserRole } from "../types/enum";
import { sendPasswordResetEmail, sendWelcomeEmail } from "./email_sending.service";
import { ZodSchema } from "zod";
import { generateResetToken } from "../utils/pkce";
import crypto from 'crypto';

export class AuthProvider {
	/**
	 * Reusable method to validate payload using Zod schema.
	 */
	private validatePayload(payload: any, schema: ZodSchema = null) {
		// const result = influencerRegisterSchema.safeParse(payload);
		const result = schema.safeParse(payload);
		if (!result.success) {
			console.log("validatePayload: ", result.error);
			const errorMessages = result.error.errors
				.map((err) => `${err.path.join(".")} ${err.message}`)
				.join(", ");
			throw new HttpError(400, errorMessages);
		}
	}

	/**
	 * Register Influencer
	 * @param payload
	 * @returns A promise that is resolved when the registration is completed.
	 */
	public async registerInfluencer(
		payload: Partial<IInfluencer>
	): Promise<AuthServiceResponse<IInfluencer>> {
		this.validatePayload(payload, influencerRegisterSchema);
		const {
			firstName,
			lastName,
			email,
			password,
			username,
			consentAndAgreements,
			privacyPolicy,
		} = payload;
		if (!firstName || !lastName || !email || !password) {
			throw new HttpError(
				400,
				// "FirstName, lastName, email, password, username, and phoneNumber are required"
				"FirstName, lastName, email, password are required"
			);
		}

		if (
			!consentAndAgreements ||
			!consentAndAgreements.termsAccepted ||
			!consentAndAgreements.dataComplianceConsent ||
			!privacyPolicy
		) {
			throw new HttpError(
				400,
				"You must accept the privacy policy terms and data compliance consent to register."
			);
		}

		try {
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				if (existingUser.isDeleted) {
					throw new HttpError(
						403,
						"Account associated with this email has been deleted. Please contact support to restore your account."
					);
				}
				throw new Conflict("User already exists");
			}

			const hashedPassword = await hash_password(password);
			const newInfluencer = new Influencer({
				firstName: firstName,
				lastName: lastName,
				email,
				password: hashedPassword,
				isVerified: true,
				username,
				// phoneNumber,
				consentAndAgreements: {
					termsAccepted: consentAndAgreements.termsAccepted,
					marketingOptIn: consentAndAgreements.marketingOptIn,
					dataComplianceConsent: consentAndAgreements.dataComplianceConsent,
				},
			});

			const createUser = await newInfluencer.save();

			try {
				await sendWelcomeEmail(email, firstName);
			} catch (emailError) {
				console.error("Failed to send welcome email:", emailError);
				throw new HttpError(500, "Failed to send welcome email");
			}

			const access_token = jwt.sign(
				{ _id: createUser._id, role: UserRole.Influencer },
				config.SECRET_TOKEN,
				{ expiresIn: "50d" }
			);

			return {
				status_code: 200,
				message: "Influencer registered successfully",
				data: createUser,
				access_token,
			};
		} catch (error) {
			console.log(error);
			throw error instanceof HttpError
				? error
				: new HttpError(500, "Internal Server Error");
		}
	}
	/**
	 * Register a Brand with the specified identifier
	 * @param payload
	 * @returns A promise that resolves when the brand is registered
	 */

	public async registerBrand(
		payload: Partial<IBrand>
	): Promise<AuthServiceResponse<IBrand>> {
		this.validatePayload(payload, brandRegisterSchema);

		const {
			firstName,
			lastName,
			companyName,
			email,
			position,
			password,
			// phoneNumber,
			consentAndAgreements,
			privacyPolicy,
		} = payload;

		if (
			!firstName ||
			!lastName ||
			!companyName ||
			!email ||
			!password ||
			!position
			// || !phoneNumber
		) {
			throw new HttpError(
				400,
				"First name, last name, company name, email, password, position, and phone number are required"
			);
		}

		if (
			!consentAndAgreements ||
			!consentAndAgreements.termsAccepted ||
			!consentAndAgreements.dataComplianceConsent ||
			!privacyPolicy 
		) {
			throw new HttpError(
				400,
				"You must accept the privacy policy, terms and data compliance consent to register."
			);
		}

		try {
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				if (existingUser.isDeleted) {
					throw new HttpError(
						403,
						"Account associated with this email has been deleted. Please contact support to restore your account."
					);
				}
				throw new Conflict("User already exists");
			}

			const hashedPassword = await hash_password(password);
			const newBrand = new Brand({
				firstName,
				lastName,
				companyName,
				email,
				position,
				// phoneNumber,
				password: hashedPassword,
				isVerified: true,
				consentAndAgreements: {
					termsAccepted: consentAndAgreements.termsAccepted,
					marketingOptIn: consentAndAgreements.marketingOptIn,
					dataComplianceConsent: consentAndAgreements.dataComplianceConsent,
				},
			});

			const createUser = await newBrand.save();

			try {
				await sendWelcomeEmail(email, firstName);
			} catch (emailError) {
				console.error("Failed to send welcome email:", emailError);
				throw new HttpError(500, "Failed to send welcome email");
			}

			const access_token = jwt.sign(
				{ id: createUser._id, role: UserRole.Brand },
				config.SECRET_TOKEN,
				{ expiresIn: "50d" }
			);

			return {
				status_code: 200,
				message: "Brand registered successfully",
				data: createUser,
				access_token,
			};
		} catch (error) {
			console.log(error);
			throw error instanceof HttpError
				? error
				: new HttpError(500, "Internal Server Error");
		}
	}

	/**
	 * Register an Admin.
	 * @param payload
	 * @returns A promise that is resolved when an Admin is created.
	 */

	public async registerAdmin(
		payload: Partial<IAdmin>
	): Promise<AuthServiceResponse<IAdmin>> {
		this.validatePayload(payload, adminRegisterSchema);
		const {
			firstName,
			lastName,
			email,
			password,
			username,
			consentAndAgreements,
			privacyPolicy,
			role,
		} = payload;

		if (role && role !== UserRole.Admin) {
			throw new HttpError(403, "You are not authorized to register an admin.");
		}

		if (!firstName || !lastName || !email || !password || !username) {
			throw new HttpError(
				400,
				"Full name, email, password,image URL, and permissions are required"
			);
		}

		if (
			!consentAndAgreements ||
			!consentAndAgreements.termsAccepted ||
			!consentAndAgreements.dataComplianceConsent ||
			!privacyPolicy
		) {
			throw new HttpError(
				400,
				"You must accept the privacy policy, terms and data compliance consent to register."
			);
		}

		try {
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				if (existingUser.isDeleted) {
					throw new HttpError(
						403,
						"Account associated with this email has been deleted. Please contact support to restore your account."
					);
				}
				throw new Conflict("User already exists");
			}

			const hashedPassword = await hash_password(password);
			const newAdmin = new Admin({
				firstName: firstName,
				lastName: lastName,
				email,
				password: hashedPassword,
				isVerified: true,
				role: UserRole.Admin,
				consentAndAgreements: {
					termsAccepted: consentAndAgreements.termsAccepted,
					marketingOptIn: consentAndAgreements.marketingOptIn,
					dataComplianceConsent: consentAndAgreements.dataComplianceConsent,
				},
			});

			const createUser = await newAdmin.save();

			try {
				await sendWelcomeEmail(email, firstName);
			} catch (emailError) {
				console.error("Failed to send welcome email:", emailError);
				throw new HttpError(500, "Failed to send welcome email");
			}

			const access_token = jwt.sign(
				{ id: createUser._id, role: UserRole.Admin },
				config.SECRET_TOKEN,
				{ expiresIn: "50d" }
			);

			return {
				status_code: 200,
				message: "Admin registered successfully",
				data: createUser,
				access_token,
			};
		} catch (error) {
			throw error instanceof HttpError
				? error
				: new HttpError(500, "Internal Server Error");
		}
	}

	/**
	 * Login a user using the provided credentials
	 * @param {string} email
	 * @param {string} password
	 * @returns A promise that resolves when the user is logged in
	 */

	public async login(
		email: string,
		password: string
	): Promise<AuthServiceResponse<IUser>> {
		if (!email || !password) {
			throw new HttpError(400, "Email and password are required");
		}

		if (!validator.isEmail(email)) {
			throw new HttpError(400, "Invalid email format");
		}

		try {
			const user = await User.findOne({ email });
			if (!user) {
				throw new HttpError(404, "User not found");
			}

			const isPasswordValid = await compare_password(password, user.password);
			if (!isPasswordValid) {
				throw new HttpError(401, "Invalid password");
			}

			const access_token = jwt.sign(
				{ id: user._id, role: user.role },
				config.SECRET_TOKEN,
				{ expiresIn: "10d" }
			);

			return {
				status_code: 200,
				message: "Login successful",
				data: user,
				access_token,
			};
		} catch (error) {
			console.log(error);
			throw error instanceof HttpError
				? error
				: new HttpError(500, "Internal Server Error");
		}
	}

	/**
	 * Send a url link to the user to reset password.
	 * @param { string } email
	 * @returns A success message or an error.
	 */

	public async forgetPassword(email: string): Promise<AuthServiceResponse<IUser>> {
		if (!email) throw new HttpError(400, "Email is required");

		try {
			const user = await User.findOne({ email });
			if (!user) throw new HttpError(404, "User not found");

			const { rawToken, hashedToken } = generateResetToken();

			user.resetPasswordToken = hashedToken;
			user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60);
			await user.save();

			const jwtResetToken = jwt.sign(
				{ rawToken, userId: user._id.toString() },
				config.SECRET_TOKEN,
				{ expiresIn: "1h" }
			);

			const resetUrl = `${config.BASE_URL}/new-password?token=${jwtResetToken}&id=${user._id}`;

			await sendPasswordResetEmail(
				email,
				user.firstName,
				resetUrl,
			)

			return {
				status_code: 200,
				message: "Password reset link sent successfully",
				data: user,
			}
		} catch (error) {
			throw new HttpError(500, `Error Sending Reset Password Link`);
		}
	}

	/**
	 * Reset a User's password
	 * @param { string } token
	 * @param { string } newPassword
	 * @param { string } confirmPassword
	 * @returns a success message or an errror.
	 */

	public async resetPassword(
		token: string,
		newPassword: string,
		confirmPassword: string
	): Promise<AuthServiceResponse<IUser>> {

		try {
			const payload = jwt.verify(token, config.SECRET_TOKEN) as {
				rawToken: string;
				userId: string;
			};
			const { rawToken, userId } = payload;

			const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

			const user = await User.findOne({
				_id: userId,
				resetPasswordToken: hashedToken,
				resetPasswordExpires: { $gt: new Date() }
			});

			if (!user) {
				throw new ResourceNotFound("User not found");
			}

			if (
				user.resetPasswordToken != hashedToken || user.resetPasswordExpires < new Date()
			) {
				throw new HttpError(400, "Reset token is invalid or had expired");
			}

			if (!newPassword || newPassword !== confirmPassword) {
				throw new HttpError(400, "Passwords do not match or are missing.");
			}
			
			user.password = await hash_password(newPassword);
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;

			await user.save();

			return {
				status_code: 200,
				message: "Password has been reset successfully",
				data: user,
			};
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				throw new HttpError(400, "Token expired, please request a new password reset");
			}
			throw new HttpError(500, `Unable To Reset Password ${error}`)
		}
	}
}
