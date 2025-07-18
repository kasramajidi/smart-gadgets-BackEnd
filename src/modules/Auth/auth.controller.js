const UserModel = require("../../models/User");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const { signUpSchema, loginSchema, findOneUserSchema, removeUserSchema, updateUserSchema } = require("./auth.validation")

exports.getAll = async (req, res) => {
    try {
        const user = await UserModel.find({}).lean()
        return res.status(200).json(user)
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body

        await signUpSchema.validate({ username, email, password })

        const emailUser = await UserModel.findOne({ email })

        if (emailUser) {
            return res.status(409).json({ message: "Email is already registered." });
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = await UserModel.create({
            username,
            email,
            password: hashPassword
        })

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        )

        newUser.token = token;
        await newUser.save()

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "User SignUp successfully!",
            token,
            newUser
        })
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.errors[0] });
        }
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        await loginSchema.validate({ email, password })

        const userFind = await UserModel.findOne({ email });

        if (!userFind) {
            return res.status(404).json({ message: "Invalid email or password." });
        }

        const comparePassword = await bcrypt.compare(password, userFind.password)

        if (!comparePassword) {
            return res.status(404).json({ message: "Invalid email or password." });
        }

        const newToken = jwt.sign(
            { id: userFind._id, role: userFind.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        await UserModel.findByIdAndUpdate(userFind._id, { token: newToken })

        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "Login successful!",
            user: {
                id: userFind._id,
                username: userFind.username,
                email: userFind.email,
                role: userFind.role
            },
            token: newToken
        })
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.errors[0] });
        }
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.guest = async (req, res) => {
    try {
        const guestToken = jwt.sign(
            { role: "guest" },
            process.env.JWT_SECRET,
            { expiresIn: "30m" }
        )

        res.cookie("token", guestToken, {
            httpOnly: true,
            secure: process.env.MODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 30 * 60 * 1000,
        })

        res.status(200).json({
            message: "Guest login successful!",
            token: guestToken
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        })
        res.status(200).json({ message: "Logged out successfully!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.remove = async (req, res) => {
    try {

        const { email } = req.body

        await removeUserSchema.validate({ email })

        const remove = await UserModel.findOneAndDelete({ email })

        if (!remove) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });

    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.errors[0] });
        }
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.update = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({
            message: "Invalid ID format"
          });
        }
    
        const { username, email, password } = req.body;
    
        await updateUserSchema.validate({ username, email, password });
    
        const updateData = {
          ...(username && { username }),
          ...(email && { email }),
        };
    
        if (password) {
          updateData.password = await bcrypt.hash(password, 10);
        }
    
        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        );
    
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }
    
        res.status(200).json({
          message: "User has been successfully updated",
          user: updatedUser
        });

    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.errors[0] });
        }
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getOne = async (req, res) => {
    try {
        const {email} = req.body

        await findOneUserSchema.validate({email})

        const findOne = await UserModel.findOne({email}).select("-password")

        if (!findOne) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(findOne)
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.errors[0] });
        }
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}