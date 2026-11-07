const authrepo = require("../repositories/repository.auth");
const bcrypt = require('bcrypt');
const validator = require('validator')
const register_user = async (username, email, password) => {
    //validation 
    if (typeof username !== "string") {
        return {
            success: false,
            error: "INVALID_USERNAME"
        };
    }

    username = username.trim();

    if (
        username.length < 3 ||
        username.length > 30 ||
        !/^[A-Za-z0-9_-]+$/.test(username)
    ) {
        return {
            success: false,
            error: "INVALID_USERNAME"
        };
    }
    if (typeof email !== "string") {
        return {
            success: false,
            error: "INVALID_EMAIL"
        };
    }

    email = email.trim();

    if (!validator.isEmail(email)) {
        return {
            success: false,
            error: "INVALID_EMAIL"
        };
    }

    if (typeof password !== 'string' || password.length < 8) {
        return {
            success: false,
            error: "INVALID_PASSWORD"
        }
    }
    if (await authrepo.find_user_by_username(username)) {
        return {
            success: false,
            error: "USERNAME_ALREADY_EXISTS"
        }
    }
    if (await authrepo.find_user_by_email(email)) {
        return {
            success: false,
            error: "EMAIL_ALREADY_EXISTS"
        }
    }
    try {
        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await authrepo.create_user(
            username,
            email,
            password_hash
        );

        return {
            success: true,
            user: newUser
        };

    } catch (err) {
        if (err.code === "23505") {
            if (err.constraint === "users_username_key") {
                return {
                    success: false,
                    error: "USERNAME_ALREADY_EXISTS"
                };
            }

            if (err.constraint === "users_email_key") {
                return {
                    success: false,
                    error: "EMAIL_ALREADY_EXISTS"
                };
            }
        }

        throw err;
    }
}

const login_user = async (identifier, password) => {

    if (typeof identifier !== "string" || identifier.trim().length === 0) {
        return {
            success: false,
            error: "INVALID_IDENTIFIER",
            message: "Username/email or password is incorrect"
        };
    }

    identifier = identifier.trim();

    if (typeof password !== 'string' || password.trim().length === 0) {
        return {
            success: false,
            error: "INVALID_PASSWORD",
            message: "Username/email or password is incorrect"
        }
    }

    const user = await authrepo.find_user_by_identifier(identifier);
    if (!user) {
        return {
            success: false,
            error: "INVALID_CREDENTIALS",
            message: "Username/email or password is incorrect"
        }
    }

    const is_password_valid = await bcrypt.compare(password, user.password_hash);
    if (!is_password_valid) {
        return {
            success: false,
            error: "INVALID_CREDENTIALS",
            message: "Username/email or password is incorrect"
        }
    }
    return {
        success: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    }


}

module.exports = {
    register_user,
    login_user
}