import { z } from "zod";
import { palopCountries } from "../../shared/types/palop.js";

export const loginTypeSchema = z.enum(["normal", "google"]);
export const userTypeSchema = z.enum(["normal"]);
export const accountTypeSchema = z.enum(["individual", "company"]);

const countrySchema = z.enum([...palopCountries] as [string, ...string[]]);

const socialLinksSchema = z.object({
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  website: z.string().url().optional(),
}).partial();

const profileDataBaseSchema = z.object({
  country: countrySchema,
  city: z.string().min(1),
  professionalPhone: z.string().min(1),
  professionalEmail: z.string().email(),
  socialLinks: socialLinksSchema.optional(),
  imageUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
});

const individualProfileSchema = profileDataBaseSchema.extend({
  accountType: z.literal("individual"),
  birthDate: z.string().date(), // "YYYY-MM-DD"
  artisticName: z.string().min(1),
  associatedWithCompany: z.object({
    status: z.boolean(),
    companyName: z.string(),
  }).optional(),
});

const companyProfileSchema = profileDataBaseSchema.extend({
  accountType: z.literal("company"),
  commercialName: z.string().min(1),
  creationDate: z.string().date(),
  isRegistered: z.boolean(),
  services: z.array(z.string()).min(1),
  otherService: z.string(),
  rentsEquipment: z.object({
    status: z.boolean(),
    equipmentName: z.string(),
  }).optional(),
});

const profileDataSchema = z.discriminatedUnion("accountType", [
  individualProfileSchema,
  companyProfileSchema,
]);

export const signupSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(120),
  email: z.string().email(),

  loginType: loginTypeSchema,
  userType: userTypeSchema,

  imageUrl: z.string().url().nullable().optional(),
  password: z.string().min(8).max(128).nullable().optional(),

  profileData: profileDataSchema,

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).superRefine((data, ctx) => {
  if (data.loginType === "normal" && !data.password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["password"],
      message: "Password é obrigatória para loginType 'normal'.",
    });
  }
});


const tempSignupProfileDataSchema = z.object({
  username: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().min(1).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional()
  ),
}).optional();
export const tempSignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  loginType: z.enum(["normal", "google"]),
  userType: z.literal("normal"),
  imageUrl: z.string().url().optional(),
  profileData: tempSignupProfileDataSchema
});

export const confirmEmailInput = z.object({
  token: z.string(),
  password: z.string()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const loginWithGoogleSchema = z.object({
  idToken: z.string().min(1),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8).max(128),
});

export type ConfirmEmailInput = z.infer<typeof confirmEmailInput>;
export type TempSignupInput = z.infer<typeof tempSignupSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LoginWithGoogleInput = z.infer<typeof loginWithGoogleSchema>;
export type ProfileDataInput = z.infer<typeof profileDataSchema>;