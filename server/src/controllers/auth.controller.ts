import { Request, Response } from "express";
import { AuthProvider } from "../services/auth.service";
import {
  IUser,
  IInfluencer,
  IBrand,
  IAdmin,
  AuthServiceResponse,
} from "../types";
import { asyncHandler } from "../middleware/helper";

const authProvider = new AuthProvider();

export class AuthController {
  /**
   * Register Influencer
   */

  public registerInfluencer = asyncHandler( async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const payload: Partial<IInfluencer> = req.body;
      console.log("registerInfluencer request body: ", payload);
      const response: AuthServiceResponse<Partial<IInfluencer>> =
        await authProvider.registerInfluencer(payload);
      console.log("registerInfluencer service response: ", response);
      return res.status(response.status_code).json(response);
    } catch (error) {
      console.log("registerInfluencer error: ", error);
      return res
        .status(error.status_code || 500)
        .json({ 
          status: "error",
          message: error.message || "Internal Server Error",
          status_code: error.status_code || 500
        });
    }
  })

  /**
   * Register Brand
   */
  public registerBrand = asyncHandler( async (req: Request, res: Response): Promise<Response> => {
    try {
      const payload: IBrand = req.body;
      console.log("registerBrand request body: ", payload);
      const response: AuthServiceResponse<Partial<IBrand>> =
        await authProvider.registerBrand(payload);
      return res.status(response.status_code).json(response);
    } catch (error) {
      return res
        .status(error.status_code || 500)
        .json({ message: error.message || "Internal Server Error" });
    }
  })

  /**
   * Register Admin
   */
  public registerAdmin = asyncHandler( async( req: Request, res: Response): Promise<Response> => {
    try {
      const payload: IAdmin = req.body;
      const response: AuthServiceResponse<Partial<IAdmin>> =
        await authProvider.registerAdmin(payload);
      return res.status(response.status_code).json(response);
    } catch (error) {
      return res
        .status(error.status_code || 500)
        .json({ message: error.message || "Internal Server Error" });
    }
  })

  /**
   * Login
   */
  public login = asyncHandler( async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: { email: string; password: string } = req.body;
    try {
      const response: AuthServiceResponse<Partial<IUser>> =
        await authProvider.login(email, password);
      return res.status(response.status_code).json(response);
    } catch (error) {
      console.log(`Error: ${error.message}`);
      return res
        .status(error.status_code || 500)
        .json({ message: error.message || "Internal Server Error" });
    }
  })

  /**
   * Forget Password
   */

  public forgetPassword = asyncHandler( async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { email }: { email: string } = req.body;
    try {
      const response: AuthServiceResponse<Partial<IUser>> =
        await authProvider.forgetPassword(email);
      return res.status(response.status_code).json(response);
    } catch (error) {
      console.log(`Error: ${error.message}`);
      return res
        .status(error.status_code || 500)
        .json({ message: error.message || "Internal Server Error" });
    }
  })
  /**
   * Reset Password
   */
  public resetPassword = asyncHandler( async (
    req: Request,
    res: Response
  ): Promise<Response> =>  {
    console.log("Reset password request body:", req.body);
    const { token, newPassword, confirmPassword }: { token: string; newPassword: string; confirmPassword: string; } = req.body;
    
    console.log("Extracted params:", {
      tokenProvided: !!token,
      tokenLength: token?.length,
      newPasswordProvided: !!newPassword,
      confirmPasswordProvided: !!confirmPassword,
      passwordsMatch: newPassword === confirmPassword
    });
    
    try {
      console.log("Calling auth service resetPassword...");
      const response: AuthServiceResponse<Partial<IUser>> =
        await authProvider.resetPassword(token, newPassword, confirmPassword);
      return res.status(response.status_code).json(response);
    } catch (error) {
      console.log(`Error: ${error.message}`);
      return res
        .status(error.status_code || 500)
        .json({ message: error.message || "Internal Server Error" });
    }
  })
}
