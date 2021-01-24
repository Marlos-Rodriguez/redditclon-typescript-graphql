import accessEnv from "./helpers/accessENV";

export const __prod__: boolean = accessEnv("NODE_ENV") === "production";
