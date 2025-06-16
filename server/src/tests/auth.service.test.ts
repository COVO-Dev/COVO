jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue(true),
    process: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
  }));
});

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(true),
    quit: jest.fn().mockResolvedValue(true),
  }));
});

jest.mock("../../src/services/email_sending.service", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),

}));

jest.mock("../../src/models/influencers.models", () => {
  return {
    Influencer: jest.fn(),
  };
});

jest.mock("../../src/models/brands.models", () => {
  return {
    Brand: jest.fn(),
  };
});
jest.mock("../../src/models/admin.models", () => {
  return {
    Admin: jest.fn(),
  };
});

jest.mock("../../src/models/users.models");
jest.mock("../../src/utils/auth_password");

import { AuthProvider } from "../services/auth.service";
import { Influencer } from "../models/influencers.models";
import { User } from "../models/users.models";
import { HttpError, Conflict } from "../middleware/errors";
import * as passwordUtils from "../utils/auth_password";
import { hash_password, compare_password } from "../utils/auth_password";
import { Brand } from "../models/brands.models";
import { Admin } from "../models/admin.models";



const authProvider = new AuthProvider();

describe("AuthProvider - registerInfluencer", () => {
  const validPayload = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "Password123!",
    username: "johnny",
    consentAndAgreements: {
      termsAccepted: true,
      marketingOptIn: false,
      dataComplianceConsent: true,
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test("should register influencer successfully", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (passwordUtils.hash_password as jest.Mock).mockResolvedValue("hashedPassword");

    (Influencer as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        _id: "user123",
        ...validPayload,
      }),
    }));

    const response = await authProvider.registerInfluencer(validPayload);

    expect(response.status_code).toBe(200);
    expect(response.message).toBe("Influencer registered successfully");
    if (!Array.isArray(response.data)) {
      expect(response.data.email).toBe(validPayload.email);
    } else {
      throw new Error("Expected response.data to be a single influencer, but got an array.");
    }
    expect(response.access_token).toBeDefined();
  });


  test("should throw HttpError if required fields are missing", async () => {
    const incompletePayload = {
      firstName: "Jane",
      lastName: "Doe",
      // missing email
      password: "Password123!",
      username: "janedoe",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: false,
        dataComplianceConsent: true,
      },
    };

    await expect(authProvider.registerInfluencer(incompletePayload as any))
      .rejects
      .toThrow(HttpError);

    await expect(authProvider.registerInfluencer(incompletePayload as any))
      .rejects
      .toThrow("email Required");
  });

  test("should throw Conflict error if user with email already exists", async () => {
    const payload = {
      firstName: "Jane",
      lastName: "Doe",
      email: "janedoe@example.com",
      password: "password123",
      username: "janedoe",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: false,
        dataComplianceConsent: true,
      },
    };

    // Mock User.findOne to simulate existing user
    (User.findOne as jest.Mock).mockResolvedValueOnce({ email: payload.email });

    const result = authProvider.registerInfluencer(payload as any);

    await expect(result)
      .rejects
      .toThrow(Conflict);

    await expect(result).rejects.toThrow("User already exists");
  });


  test("should throw 403 error if account is soft deleted", async () => {
    const payload = {
      firstName: "Jake",
      lastName: "Smith",
      email: "jakesmith@example.com",
      password: "password123",
      username: "jakesmith",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: false,
        dataComplianceConsent: true,
      },
    };

    // Mock User.findOne to simulate a soft-deleted account
    (User.findOne as jest.Mock).mockResolvedValueOnce({ _id: "USER123", email: payload.email, isDeleted: true });

    const result = authProvider.registerInfluencer(payload as any);

    await expect(result)
      .rejects
      .toThrow(HttpError);

    await expect(result)
      .rejects
      .toThrow("Account associated with this email has been deleted. Please contact support to restore your account.");
  });


  test("should throw 500 error if saving the influencer fails", async () => {
    const payload = {
      firstName: "Emma",
      lastName: "Brown",
      email: "emmabrown@example.com",
      password: "password123",
      username: "emmabrown",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: true,
        dataComplianceConsent: true,
      },
    };

    // Mock User.findOne to simulate no existing user
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    // Mock the influencer save method to throw an error
    const mockSave = jest.fn().mockRejectedValueOnce(new Error("Database save failed"));
    (Influencer as unknown as jest.Mock).mockImplementation(() => ({ save: mockSave }));

    const result = authProvider.registerInfluencer(payload as any);

    await expect(result)
      .rejects
      .toThrow(HttpError);

    await expect(result)
      .rejects
      .toThrow("Internal Server Error");
  });

  test("should throw an error if consent and agreements are missing or invalid", async () => {
    const payload = {
      firstName: "Sarah",
      lastName: "Taylor",
      email: "sarahtaylor@example.com",
      password: "password123",
      username: "sarahtaylor",
      // Missing consentAndAgreements
    };

    // Mock User.findOne to simulate no existing user
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    // Try registering influencer with missing consent
    await expect(authProvider.registerInfluencer(payload as any)).rejects.toThrow(
      new HttpError(400, "You must accept the terms and data compliance consent to register.")
    );
  });

  test("should throw an error if termsAccepted or dataComplianceConsent are false", async () => {
    const payload = {
      firstName: "Emily",
      lastName: "Davis",
      email: "emilydavis@example.com",
      username: "emilydavis",
      password: "password123",
      consentAndAgreements: {
        termsAccepted: false, // terms not accepted
        marketingOptIn: true,
        dataComplianceConsent: false, // data consent not given
      },
    };

    // Mock User.findOne to simulate no existing user
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    // Try registering influencer with invalid consent
    await expect(authProvider.registerInfluencer(payload as any)).rejects.toThrow(
      new HttpError(400, "You must accept the terms and data compliance consent to register.")
    );
  });
});


describe("AuthProvider - registerBrand", () => {
  const validPayload = {
    firstName: "Alice",
    lastName: "Johnson",
    companyName: "TechCorp",
    email: "alicejohnson@techcorp.com",
    password: "SecurePassword123!",
    position: "CTO",
    consentAndAgreements: {
      termsAccepted: true,
      marketingOptIn: true,
      dataComplianceConsent: true,
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test("should register brand successfully", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (passwordUtils.hash_password as jest.Mock).mockResolvedValue("hashedPassword");

    (Brand as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        _id: "user123",
        ...validPayload,
      }),
    }));

    const response = await authProvider.registerBrand(validPayload);

    expect(response.status_code).toBe(200);
    expect(response.message).toBe("Brand registered successfully");
    if (!Array.isArray(response.data)) {
      expect(response.data.email).toBe(validPayload.email);
    } else {
      throw new Error("Expected response.data to be a single Brand, but got an array.");
    }
    expect(response.access_token).toBeDefined();
  });


  test("should throw an error if required fields are missing", async () => {
    const payload = {
      firstName: "John",
      // Missing lastName, companyName, email, position, password
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: true,
        dataComplianceConsent: true,
      },
    };

    // Try registering brand with missing fields
    await expect(authProvider.registerBrand(payload as any)).rejects.toThrow(
      new HttpError(400, "companyName Required, email Required, password Required, position Required")
    );
  });

  test("should throw an error if the brand already exists", async () => {
    const payload = {
      firstName: "Alice",
      lastName: "Johnson",
      companyName: "TechCorp",
      username: "johndoe",
      email: "alicejohnson@techcorp.com",
      password: "SecurePassword123!",
      position: "CTO",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: true,
        dataComplianceConsent: true,
      },
    };

    (User.findOne as jest.Mock).mockResolvedValueOnce({ email: payload.email });

    const result = authProvider.registerBrand(payload as any);

    await expect(result)
      .rejects
      .toThrow(Conflict);

    await expect(result).rejects.toThrow("User already exists");
  });

  test("should throw an error if the brand is soft-deleted", async () => {
    const userPayload = {
      firstName: "John",
      lastName: "Doe",
      companyName: "TechCorp",
      email: "johndoe@techcorp.com",
      username: "johndoe",
      position: "CEO",
      password: "password123",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: true,
        dataComplianceConsent: true,
      },
    };

    // Mock User.findOne to simulate existing brand, but isDeleted is true
    const existingUserMock = { email: userPayload.email, isDeleted: true };
    (User.findOne as jest.Mock).mockResolvedValueOnce(existingUserMock);

    const result = authProvider.registerBrand(userPayload as any);

    await expect(result).rejects.toThrow(
      new HttpError(403, "Account associated with this email has been deleted. Please contact support to restore your account.")
    );
  });

  test("should throw an error if there is a server error while saving the brand", async () => {
    const payload = {
      firstName: "John",
      lastName: "Doe",
      companyName: "TechCorp",
      email: "johndoe@techcorp.com",
      username: "johndoe",
      position: "CSO",
      password: "password123",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: true,
        dataComplianceConsent: true,
      },
    };

    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    // Mock the influencer save method to throw an error
    const mockSave = jest.fn().mockRejectedValueOnce(new Error("Database save failed"));
    (Brand as unknown as jest.Mock).mockImplementation(() => ({ save: mockSave }));

    const result = authProvider.registerBrand(payload as any);

    await expect(result)
      .rejects
      .toThrow(HttpError);

    await expect(result)
      .rejects
      .toThrow("Internal Server Error");
  });

  test("should throw an error if termsAccepted or dataComplianceConsent are false", async () => {
    const payload = {
      firstName: "Emily",
      lastName: "Davis",
      companyName: "Fashionista",
      username: "emilydavis",
      position: "Fashion Blogger",
      email: "emilydavis@example.com",
      password: "password123",
      consentAndAgreements: {
        termsAccepted: false,
        marketingOptIn: true,
        dataComplianceConsent: false,
      },
    };

    // Mock User.findOne to simulate no existing user
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    // Try registering influencer with invalid consent
    await expect(authProvider.registerBrand(payload as any)).rejects.toThrow(
      new HttpError(400, "You must accept the terms and data compliance consent to register.")
    );
  });

  test("should throw an error if consent and agreements are invalid", async () => {
    const payload = {
      firstName: "John",
      lastName: "Doe",
      companyName: "TechCorp",
      username: "johndoe",
      email: "johndoe@techcorp.com",
      position: "CEO",
      password: "password123",
      consentAndAgreements: {
        termsAccepted: false,
        marketingOptIn: true,
        dataComplianceConsent: true,
      },
    };

    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(authProvider.registerBrand(payload as any)).rejects.toThrow(
      new HttpError(400, "You must accept the terms and data compliance consent to register.")
    );
  });
});

// Test for registerAdmin function
// This test will check if the registerAdmin function works as expected
describe("AuthProvider - registerAdmin", () => {
  const validPayload = {
    firstName: "Alice",
    lastName: "Johnson",
    username: "alicejohnson",
    email: "alicejohnson@alice.com",
    password: "SecurePassword123!",
    consentAndAgreements: {
      termsAccepted: true,
      marketingOptIn: true,
      dataComplianceConsent: true,
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test("should register admin successfully", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (passwordUtils.hash_password as jest.Mock).mockResolvedValue("hashedPassword");

    (Admin as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        _id: "user123",
        ...validPayload,
      }),
    }));

    const response = await authProvider.registerAdmin(validPayload);

    expect(response.status_code).toBe(200);
    expect(response.message).toBe("Admin registered successfully");
    if (!Array.isArray(response.data)) {
      expect(response.data.email).toBe(validPayload.email);
    } else {
      throw new Error("Expected response.data to be a single Admin, but got an array.");
    }
    expect(response.access_token).toBeDefined();
  });

  test("should throw an error if the admin already exists", async () => {
    const payload = {
      firstName: "Admin",
      lastName: "User",
      username: "adminuser",
      email: "admin@example.com",
      password: "admin123",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: true,
        dataComplianceConsent: true,
      },
    };
  
    // Mock User.findOne to simulate existing admin
    const existingUserMock = { email: payload.email, isDeleted: false };
    (User.findOne as jest.Mock).mockResolvedValueOnce(existingUserMock);
  
    // Try registering admin with an existing email
    await expect(authProvider.registerAdmin(payload as any)).rejects.toThrow(
      new Conflict("User already exists")
    );
  });

  test("should throw an error if the provided role is invalid (not admin)", async () => {
    // Set up an invalid payload with an invalid role
    const invalidPayload = {
      ...validPayload,
      role: "not-admin",
    };

    // Mock User.findOne to return null (no existing user)
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (passwordUtils.hash_password as jest.Mock).mockResolvedValue("hashedPassword");

    // Mock the Admin save function
    (Admin as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        _id: "user123",
        ...invalidPayload,
      }),
    }));

    // Try to register an admin with an invalid role
    await expect(authProvider.registerAdmin(invalidPayload as any)).rejects.toThrow(
      new HttpError(403, "You are not authorized to register an admin.")
    );
  });


  test("should throw an error if there is a server error while saving the admin", async () => {
    const payload = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: "admin123",
      username: "adminuser",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: true,
        dataComplianceConsent: true,
      },
    };
  
    // Mock User.findOne to simulate no existing admin
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);
  
    // Mock an error while saving the admin
    (User.prototype.save as jest.Mock).mockRejectedValueOnce(new Error("Database error"));
  
    // Try registering admin with a save error
    await expect(authProvider.registerAdmin(payload as any)).rejects.toThrow(
      new HttpError(500, "Internal Server Error")
    );
  });
  
  test("should throw an error if the email format is invalid", async () => {
    const payload = {
      firstName: "Admin",
      lastName: "User",
      email: "invalid-email",
      password: "admin123",
      username: "adminuser",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: true,
        dataComplianceConsent: true,
      },
    };
  
    // Try registering admin with an invalid email
    await expect(authProvider.registerAdmin(payload as any)).rejects.toThrow(
      new HttpError(400, "email Invalid email address")
    );
  });  


  test("should throw an error if termsAccepted or dataComplianceConsent are false", async () => {
    const payload = {
      firstName: "Emily",
      lastName: "Davis",
      username: "emilydavis",
      email: "emilydavis@example.com",
      password: "password123",
      consentAndAgreements: {
        termsAccepted: false,
        marketingOptIn: true,
        dataComplianceConsent: false,
      },
    };

    // Mock User.findOne to simulate no existing user
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    // Try registering influencer with invalid consent
    await expect(authProvider.registerAdmin(payload as any)).rejects.toThrow(
      new HttpError(400, "You must accept the terms and data compliance consent to register.")
    );
  });

  test("should throw an error if consent and agreements are invalid", async () => {
    const payload = {
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "johndoe@techcorp.com",
      password: "password123",
      consentAndAgreements: {
        termsAccepted: false,
        marketingOptIn: true,
        dataComplianceConsent: true,
      },
    };

    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(authProvider.registerAdmin(payload as any)).rejects.toThrow(
      new HttpError(400, "You must accept the terms and data compliance consent to register.")
    );
  });

  test("should throw an error if admin is soft-deleted", async () => {
    const payload = {
      firstName: "Jake",
      lastName: "Smith",
      email: "jakesmith@smith.com",
      password: "password123",
      username: "jakesmith",
      consentAndAgreements: {
        termsAccepted: true,
        marketingOptIn: false,
        dataComplianceConsent: true,
      },
    };

    // Mock User.findOne to simulate existing admin, but isDeleted is true
    const existingUserMock = { email: payload.email, isDeleted: true };
    (User.findOne as jest.Mock).mockResolvedValueOnce(existingUserMock);

    // Try registering admin with a soft-deleted account
    const result = authProvider.registerAdmin(payload as any);

    await expect(result).rejects.toThrow(
      new HttpError(403, "Account associated with this email has been deleted. Please contact support to restore your account.")
    );
  });
});


// Test for login function
// This test will check if the login function works as expected

describe("AuthProvider.login", () => {

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  test("should login", async () => {
    const loginData = {
      email: "influencer@example.com",
      password: "password123",
    };

    const mockUser = {
      _id: "user123",
      email: "influencer@example.com",
      password: "hashedpassword",
    };

    // Mock User.findOne and compare_password
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    (passwordUtils.compare_password as jest.Mock).mockResolvedValue(true);
    jest.spyOn(passwordUtils, "compare_password").mockResolvedValue(true);

    const loginResponse = await authProvider.login(
      loginData.email,
      loginData.password
    );

    expect(loginResponse.status_code).toBe(200);
    expect(loginResponse.message).toBe("Login successful");
    expect(loginResponse.data).toBeDefined();
    expect(loginResponse.access_token).toBeDefined();
  });

  test("should throw an error if user not found", async () => {
    const loginData = {
      email: "deo@example.com",
      password: "password123",
    };
    
    // Mock User.findOne to return null
    User.findOne = jest.fn().mockResolvedValue(null);
    (passwordUtils.compare_password as jest.Mock).mockResolvedValue(false);
    jest.spyOn(passwordUtils, "compare_password").mockResolvedValue(false);

    const result = authProvider.login(
      loginData.email,
      loginData.password
    );
    await expect(result).rejects.toThrow(
      new HttpError(404, "User not found")
    );
  });

  test("should throw an error if password is incorrect", async () => {
    const loginData = {
      email: "influencer@example.com",
      password: "wrongpassword",
    };

    const mockUser = {
      _id: "user123",
      email: "pop@example.com",
      password: "hashedpassword",
    };

    // Mock User.findOne to return a user
    User.findOne = jest.fn().mockResolvedValue(mockUser);
    (passwordUtils.compare_password as jest.Mock).mockResolvedValue(false);
    jest.spyOn(passwordUtils, "compare_password").mockResolvedValue(false);

    const result = authProvider.login(
      loginData.email,
      loginData.password
    );
    await expect(result).rejects.toThrow(
      new HttpError(401, "Invalid password")
    );
  });

  test("should throw an error if password is not provided", async () => {
    const loginData = {
      email: "example@example.com",
      password: "",
    };

    const result = authProvider.login(
      loginData.email,
      loginData.password
    );
    await expect(result).rejects.toThrow(
      new HttpError(400, "Email and password are required")
    );
  });

  test("should throw an error if email is not provided", async () => {
    const loginData = {
      email: "",
      password: "password123",
    };

    const result = authProvider.login(
      loginData.email,
      loginData.password
    );

    await expect(result).rejects.toThrow(
      new HttpError(400, "Email and password are required")
    );
  });

  test("should throw an error if email format is invalid", async () => {
    const loginData = {
      email: "invalid-email",
      password: "password123",
    };

    await expect(authProvider.login(loginData.email, loginData.password)).rejects.toThrow(
      new HttpError(400, "Invalid email format")
    );
  });

  test("should throw an error if email is not found", async () => {
    const loginData = {
      email: "nonexistent@example.com",
      password: "password123",
    };

    await expect(authProvider.login(loginData.email, loginData.password)).rejects.toThrow(
      new HttpError(404, "User not found")
    );
  });
});