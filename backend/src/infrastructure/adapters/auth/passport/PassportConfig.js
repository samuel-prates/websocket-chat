const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../../persistence/mongodb/models/User'); // Usar o modelo Mongoose

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
            try {
                const user = await User.findOne({ username: username });
                if (!user) {
                    return done(null, false, { message: 'That username is not registered' });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (err) {
                console.log(err);
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
