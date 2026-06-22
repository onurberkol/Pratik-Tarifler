import * as admin from "firebase-admin";

admin.initializeApp();

export { validateIAP } from "./validateIAP";
export { onUserCreated } from "./onUserCreated";
export { purgeUserData } from "./purgeUserData";
export { seedDatabase } from "./seedDatabase";
