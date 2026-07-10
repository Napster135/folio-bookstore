import passport from "passport";
import GitHubStrategy from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userModel } from "../models/users.model.js";
import { serviceAddCart } from "../services/cart.js";
import { GITHUB_ID, GITHUB_SECRET, GOOGLE_ID, GOOGLE_SECRET, APP_URL } from "./index.config.js";

const initializePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user = await userModel.findOne({ _id: id });
    done(null, user);
  });

  // ── GitHub (solo si las credenciales están configuradas) ─────
  if (GITHUB_ID && GITHUB_SECRET) {
    passport.use(
      "github",
      new GitHubStrategy(
        {
          clientID: GITHUB_ID,
          clientSecret: GITHUB_SECRET,
          callbackURL: `${APP_URL}/auth/githubcallback`,
          scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails[0].value;
            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
              await userModel.findOneAndUpdate(
                { email },
                { lastLoginDate: new Date() },
                { new: true }
              );
              return done(null, existingUser);
            }
            const newCart = await serviceAddCart();
            const newUser = await userModel.create({
              first_name: profile._json.login,
              last_name: " ",
              age: 0,
              email,
              password: " ",
              cartId: newCart._id,
              lastLoginDate: new Date(),
            });
            done(null, newUser);
          } catch (error) {
            done(error);
          }
        }
      )
    );
  }

  // ── Google (solo si las credenciales están configuradas) ─────
  if (GOOGLE_ID && GOOGLE_SECRET) {
    passport.use(
      "google",
      new GoogleStrategy(
        {
          clientID: GOOGLE_ID,
          clientSecret: GOOGLE_SECRET,
          callbackURL: `${APP_URL}/auth/googlecallback`,
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error("No email from Google profile"));

            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
              await userModel.findOneAndUpdate(
                { email },
                { lastLoginDate: new Date() },
                { new: true }
              );
              return done(null, existingUser);
            }

            const newCart = await serviceAddCart();
            const newUser = await userModel.create({
              first_name: profile.name?.givenName || profile.displayName,
              last_name: profile.name?.familyName || " ",
              age: 0,
              email,
              password: " ",
              cartId: newCart._id,
              lastLoginDate: new Date(),
            });
            done(null, newUser);
          } catch (error) {
            done(error);
          }
        }
      )
    );
  }
};

export default initializePassport;
