/**
 * Verification service layer
 * In production, replace the mock logic with real provider calls
 * (Smile Identity, Youverify, Prembly, Mono, etc.)
 */

import { v4 as uuidv4 } from "uuid";

interface BVNInput {
  bvn: string;
  firstName?: string;
  lastName?: string;
}

interface NINInput {
  nin: string;
  firstName?: string;
  lastName?: string;
}

interface DocumentInput {
  documentType: string;
  documentImage: string;
  selfieImage?: string;
}

interface FaceMatchInput {
  image1: string;
  image2: string;
}

export async function verifyBVN(input: BVNInput) {
  const isValidFormat = /^\d{11}$/.test(input.bvn);

  return {
    requestId: uuidv4(),
    verified: isValidFormat,
    bvn: input.bvn,
    firstName: input.firstName || "ADEBAYO",
    lastName: input.lastName || "OKAFOR",
    middleName: "CHUKWUMA",
    dateOfBirth: "1990-05-14",
    phone: "0803*******",
    enrollmentBank: "044",
    enrollmentBranch: "LAGOS",
    registrationDate: "2015-03-22",
    watchListed: false,
    timestamp: new Date().toISOString(),
    provider: "mock",
  };
}

export async function verifyNIN(input: NINInput) {
  const isValidFormat = /^\d{11}$/.test(input.nin);

  return {
    requestId: uuidv4(),
    verified: isValidFormat,
    nin: input.nin,
    firstName: input.firstName || "CHIEMEKA",
    lastName: input.lastName || "NWOSU",
    middleName: "IFEOMA",
    dateOfBirth: "1988-11-03",
    gender: "F",
    phone: "0706*******",
    timestamp: new Date().toISOString(),
    provider: "mock",
  };
}

export async function verifyDocument(input: DocumentInput) {
  return {
    requestId: uuidv4(),
    verified: true,
    documentType: input.documentType,
    extractedData: {
      fullName: "ADEBAYO CHUKWUMA OKAFOR",
      documentNumber: "A12345678",
      dateOfBirth: "1990-05-14",
      expiryDate: "2030-05-14",
      nationality: "NGA",
    },
    faceMatchScore: input.selfieImage ? 94.7 : null,
    timestamp: new Date().toISOString(),
    provider: "mock",
  };
}

export async function faceMatch(input: FaceMatchInput) {
  return {
    requestId: uuidv4(),
    match: true,
    confidence: 92.4,
    threshold: 80,
    timestamp: new Date().toISOString(),
    provider: "mock",
  };
}
