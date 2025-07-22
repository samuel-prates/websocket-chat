const bcrypt = require('bcrypt');

class AuthAdapter {
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async comparePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
}

module.exports = AuthAdapter;