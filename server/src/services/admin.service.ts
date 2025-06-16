import { Admin } from "../models/admin.models";
import { User } from "../models/users.models";
import { Brand } from "../models/brands.models";
import { IUser, IPlatformData } from "../types";
import { UserRole } from "../types/enum";
import { ServiceResponse } from "../types";
import { ResourceNotFound, HttpError, ServerError, BadRequest} from "../middleware/errors";
import { Influencer } from "../models/influencers.models";

export class AdminService {

    /**
     * Fetch All Users with their details by admin
     * 
     * @param adminId ID of the admin to verify access
     * @returns A Promise that resolves to a list of all users
     */ 

    public async getAllUsersByAdmin(adminId: string): Promise<ServiceResponse<IUser[]>> {
        try {
            if (!adminId) {
                throw new BadRequest("Admin ID is required");
            }
            const user = await User.find({}, "-password");
            if (!user || user.length === 0) {
                throw new ResourceNotFound("No user found");
            }
            return {
                status_code: 200,
                message: "Users fetched successfully",
                data: user,
            };
        } catch (err) {
            throw new HttpError(err.code, `Error fetching users: ${err}`);
        }
    }

    /**
     * Update A User with their details
     * 
     * @returns A Promise that resolves to a list of
     */

    public async updateUserByAdmin(adminId: string, id: string, data: IUser,): Promise<ServiceResponse<IUser>> {
        try {
            if (!adminId || !id) {
                throw new BadRequest("Admin ID and User ID are required");
            }
            const user = await User.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            });
            if (!user) {
                throw new ResourceNotFound("User not found");
            }
            return {
                status_code: 200,
                message: "User updated successfully",
                data: user,
            };
        } catch (err) {
            throw new HttpError(err.code, `Error updating user: ${err}`);
        }
    }

    /**
     * Delete A User with their details
     * 
     * @returns A Promise that resolves to a list of
     */
    public async deleteUserByAdmin(adminId: string, id: string): Promise<ServiceResponse<IUser>> {
        try {
            if (!adminId || !id) {
                throw new BadRequest("Admin ID and User ID are required");
            }
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                throw new ResourceNotFound("User not found");
            }
            return {
                status_code: 200,
                message: "User deleted successfully",
                data: user,
            }

        } catch (err) {
            throw new HttpError(err.code, `Error deleting user ${err}`);
        }
    }
      

    /**
     * Fetch plateform data from the database for admin users
     * 
     * @returns A Promise that resolves to a list of all plateform data
     */
    public async getPlateformData(adminId: string): Promise<ServiceResponse<IPlatformData>> {
        try{
            if (!adminId) {
                throw new BadRequest("Admin ID is required");
            }
            const userCount: number = await User.countDocuments();
            const brandCount: number = await Brand.countDocuments({ role: UserRole.Brand, is_active: true });
            const influencerCount: number = await Influencer.countDocuments({ role: UserRole.Influencer, is_active: true });
            const adminCount: number = await Admin.countDocuments({ role: UserRole.Admin, is_active: true });

            if(!userCount || !brandCount || !influencerCount || !adminCount) {
                return {
                    status_code: 404,
                    message: "No plateform data found",
                    data: null,
                }
            }

            return {
                status_code: 200,
                message: "Plateform data fetched successfully",
                data: {
                    userCount,
                    brandCount,
                    influencerCount,
                    adminCount,
                },
            };
        } catch (err) {
            if(err.code === 500) {
                throw new HttpError(err.code, `Error fetching plateform data: ${err}`);
            }
            throw new ServerError(`Error fetching plateform data: ${err}`);
            
            
        }
    }
}



// import { Ability } from '@casl/ability';
// import { defineAdminAbility } from '../utils/ability';
// import { Admin } from "../models/admin.models";
// import { User } from "../models/users.models";
// import { Brand } from "../models/brands.models";
// import { IUser, IPlatformData } from "../types";
// import { UserRole } from "../types/enum";
// import { ServiceResponse } from "../types";
// import { ResourceNotFound, HttpError, ServerError, BadRequest} from "../middleware/errors";
// import { Influencer } from "../models/influencers.models";


// export class AdminService {

//     // Fetch All Users with their details by admin
//     public async getAllUsersByAdmin(adminId: string): Promise<ServiceResponse<IUser[]>> {
//         try {
//             if (!adminId) {
//                 throw new BadRequest("Admin ID is required");
//             }

//             const user = await User.find({}, "-password");
//             if (!user || user.length === 0) {
//                 throw new ResourceNotFound("No user found");
//             }

//             return {
//                 status_code: 200,
//                 message: "Users fetched successfully",
//                 data: user,
//             };
//         } catch (err) {
//             throw new HttpError(err.code, `Error fetching users: ${err}`);
//         }
//     }

//     // Update a User by admin
//     public async updateUserByAdmin(adminId: string, id: string, data: IUser): Promise<ServiceResponse<IUser>> {
//         try {
//             if (!adminId || !id) {
//                 throw new BadRequest("Admin ID and User ID are required");
//             }

//             const user = await User.findByIdAndUpdate(id, data, {
//                 new: true,
//                 runValidators: true,
//             });
//             if (!user) {
//                 throw new ResourceNotFound("User not found");
//             }

//             return {
//                 status_code: 200,
//                 message: "User updated successfully",
//                 data: user,
//             };
//         } catch (err) {
//             throw new HttpError(err.code, `Error updating user: ${err}`);
//         }
//     }

//     // Delete a User by admin
//     public async deleteUserByAdmin(adminId: string, id: string): Promise<ServiceResponse<IUser>> {
//         try {
//             if (!adminId || !id) {
//                 throw new BadRequest("Admin ID and User ID are required");
//             }

//             const user = await User.findByIdAndDelete(id);
//             if (!user) {
//                 throw new ResourceNotFound("User not found");
//             }

//             return {
//                 status_code: 200,
//                 message: "User deleted successfully",
//                 data: user,
//             };
//         } catch (err) {
//             throw new HttpError(err.code, `Error deleting user ${err}`);
//         }
//     }

//     // Fetch platform data for admin
//     public async getPlateformData(adminId: string): Promise<ServiceResponse<IPlatformData>> {
//         try {
//             if (!adminId) {
//                 throw new BadRequest("Admin ID is required");
//             }

//             const ability = defineAdminAbility(adminId);
//             if (!ability.can('read', 'PlatformData')) {
//                 throw new HttpError(403, "Admin does not have permission to read platform data.");
//             }

//             const userCount: number = await User.countDocuments();
//             const brandCount: number = await Brand.countDocuments({ role: UserRole.Brand, is_active: true });
//             const influencerCount: number = await Influencer.countDocuments({ role: UserRole.Influencer, is_active: true });
//             const adminCount: number = await Admin.countDocuments({ role: UserRole.Admin, is_active: true });

//             if (!userCount || !brandCount || !influencerCount || !adminCount) {
//                 return {
//                     status_code: 404,
//                     message: "No platform data found",
//                     data: null,
//                 };
//             }

//             return {
//                 status_code: 200,
//                 message: "Platform data fetched successfully",
//                 data: {
//                     userCount,
//                     brandCount,
//                     influencerCount,
//                     adminCount,
//                 },
//             };
//         } catch (err) {
//             if (err.code === 500) {
//                 throw new HttpError(err.code, `Error fetching platform data: ${err}`);
//             }
//             throw new ServerError(`Error fetching platform data: ${err}`);
//         }
//     }
// }
