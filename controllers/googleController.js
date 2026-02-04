const axios = require("axios");
const crypto = require("crypto");
const User = require("../models/userModels");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");

exports.googleLogin = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.body;

    // Verify access token and get user info from Google API
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const { name, email, picture, sub: googleId } = response.data;

    let user = await User.findOne({ email });

    if (user) {
        if (!user.googleId) {
            user.googleId = googleId;
            if (!user.avatar?.url) {
                user.avatar = {
                    public_id: "google_avatar",
                    url: picture,
                };
            }
            await user.save();
        }
    } else {
        user = await User.create({
            name,
            email,
            googleId,
            password: crypto.randomBytes(20).toString("hex"), // Random secure password
            avatar: {
                public_id: "google_avatar",
                url: picture,
            },
        });
    }

    sendToken(user, 201, res);
});
