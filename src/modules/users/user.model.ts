import type { BaseEntity } from "../../shared/repositories/memory-store.js";
import type { PalopCountry } from "../../shared/types/palop.js";

export type LoginType = "normal" | "google";
export type UserType = "normal";
export type AccountType = "individual" | "company";

export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
};

export type ProfileAchievement = {
  id: string;
  type: string;
  title: string;
  link?: string;
};

export type ProfileFilm = {
  id: string;
  title: string;
  director: string;
  type: string[];
  year: number;
  countries: string[];
  cover: string;
  duration?: string;
  link?: string;
};

type ProfileDataBase = {
  country: PalopCountry;
  city: string;
  professionalPhone: string;
  professionalEmail: string;
  socialLinks?: SocialLinks;
  imageUrl?: string;
  coverImageUrl?: string;

  profession?: string;
  bio?: string;
  skills?: string[];
  achievements?: ProfileAchievement[];
  filmography?: ProfileFilm[];
  outsideAgency?: ProfileFilm[];
  username?: string;
};

export type IndividualProfileData = ProfileDataBase & {
  accountType: "individual";
  birthDate: string;
  artisticName: string;
  associatedWithCompany?: { status: boolean; companyName: string };
};

export type CompanyProfileData = ProfileDataBase & {
  accountType: "company";
  commercialName: string;
  creationDate: string;
  isRegistered: boolean;
  services: string[];
  otherService: string;
  rentsEquipment?: { status: boolean; equipmentName: string };
};

export type ProfileData = IndividualProfileData | CompanyProfileData;

export type User = BaseEntity & {
  name: string;
  email: string;

  loginType: LoginType;
  userType: UserType;

  imageUrl?: string;
  passwordHash?: string;

  profileData: ProfileData | null;

  isActive: boolean;
  isEmailConfirmed: boolean;

  emailConfirmationToken?: string | null;
  emailConfirmationExpiresAt?: Date | null;

  passwordResetToken?: string | null;
  passwordResetExpiresAt?: Date | null;
};

export type PublicUser = {
  id: string;

  name: string;
  email: string;

  loginType: LoginType;
  userType: UserType;

  imageUrl?: string;

  profileData: ProfileData | null;

  isActive: boolean;
  isEmailConfirmed: boolean;

  createdAt: Date;
  updatedAt: Date;
};


export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,

    name: user.name,
    email: user.email,

    loginType: user.loginType,
    userType: user.userType,

    imageUrl: user.imageUrl,

    profileData: user.profileData,

    isActive: user.isActive,
    isEmailConfirmed: user.isEmailConfirmed,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}