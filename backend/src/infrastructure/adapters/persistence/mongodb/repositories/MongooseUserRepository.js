const UserDomain = require('../../../../../application/domain/User');
const UserModel = require('../models/User');

class MongooseUserRepository {
    async findByEmail(email) {
        const user = await UserModel.findOne({ email });
        return user ? new UserDomain(user._id, user.name, user.email, user.password, user.online) : null;
    }

    async findById(id) {
        const user = await UserModel.findById(id);
        return user ? new UserDomain(user._id, user.name, user.email, user.password, user.online) : null;
    }

    async save(user) {
        let userModel;
        if (user.id) {
            userModel = await UserModel.findById(user.id);
            if (!userModel) {
                throw new Error('User not found');
            }
            userModel.name = user.name;
            userModel.email = user.email;
            userModel.password = user.password;
            userModel.online = user.online;
        } else {
            userModel = new UserModel({
                name: user.name,
                email: user.email,
                password: user.password,
                online: user.online
            });
        }
        const savedUser = await userModel.save();
        return new UserDomain(savedUser._id, savedUser.name, savedUser.email, savedUser.password, savedUser.online);
    }

    async updateOnlineStatus(userId, status) {
        const user = await UserModel.findByIdAndUpdate(userId, { online: status }, { new: true });
        return user ? new UserDomain(user._id, user.name, user.email, user.password, user.online) : null;
    }

    async findAll() {
        const users = await UserModel.find();
        return users.map(user => new UserDomain(user._id, user.name, user.email, user.password, user.online));
    }
}

module.exports = MongooseUserRepository;