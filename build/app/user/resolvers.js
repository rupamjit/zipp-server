"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../../client/db");
const jwt_1 = __importDefault(require("../../services/jwt"));
const queries = {
    verifyGoogleToken: (parent_1, _a) => __awaiter(void 0, [parent_1, _a], void 0, function* (parent, { token }) {
        const googleToken = token;
        const googleOauthBaseURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleOauthBaseURL.searchParams.set("id_token", googleToken);
        const { data: googleResponse } = yield axios_1.default.get(googleOauthBaseURL.toString(), {
            responseType: "json",
        });
        const checkForUser = yield db_1.prismaClient.user.findUnique({
            where: {
                email: googleResponse.email,
            },
        });
        if (!checkForUser) {
            yield db_1.prismaClient.user.create({
                data: {
                    email: googleResponse.email,
                    firstName: googleResponse.given_name,
                    lastName: googleResponse.family_name,
                    profileImageUrl: googleResponse.picture,
                },
            });
        }
        const userInDB = yield db_1.prismaClient.user.findUnique({
            where: {
                email: googleResponse.email,
            },
        });
        if (!userInDB)
            throw new Error("User with this email not found!!!");
        const userToken = jwt_1.default.generateTokenForUser(userInDB);
        return userToken;
    }),
    getCurrentUser: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const id = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return null;
        const getUser = yield db_1.prismaClient.user.findUnique({
            where: {
                id,
            },
        });
        return getUser;
    }),
};
const extraResolvers = {
    User: {
        tweets: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const tweets = db_1.prismaClient.tweet.findMany({
                where: {
                    authorId: parent.id
                }
            });
            return tweets;
        })
    }
};
exports.resolvers = { queries, extraResolvers };
