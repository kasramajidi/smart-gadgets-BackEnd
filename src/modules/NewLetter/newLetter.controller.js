const sendEmail = require('../../utils/NewLetter/sendEmail');
const NewsletterModel = require("./../../models/Newsletter");
const newLetterSchema = require('./newLetter.validation');


exports.create = async (req, res) => {
    try {
        const { email } = req.body;
        await newLetterSchema.validate({ email });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

        const newsletter = await NewsletterModel.findOneAndUpdate(
            { email },
            { code, codeExpiresAt, isActive: false },
            { upsert: true, new: true }
        );

        await sendEmail(email, 'Newsletter confirmation code', `Your verification code: ${code}`);

        res.status(200).json({ message: 'Verification code sent to email!' }, newsletter);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.errors[0] });
        }
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAll = async (req, res) => {
    try {
        const newLetter = await NewsletterModel.find({}).lean()
        return res.status(200).json(newLetter)
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.remove = async (req, res) => {
    try {
        const { email } = req.body

        await newLetterSchema.validate({ email })

        const remove = await NewsletterModel.findOneAndDelete({ email })

        if (!remove) {
            return res.status(404).json({ error: 'NewLetter not found' });
        }

        res.json({ message: 'NewLetter deleted successfully' });
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
        const { oldEmail, newEmail } = req.body;
        await newLetterSchema.validate({ email: newEmail });

        const updatedNewsletter = await NewsletterModel.findOneAndUpdate(
            { email: oldEmail },
            { email: newEmail },
            { new: true }
        );

        if (!updatedNewsletter) {
            return res.status(404).json({ message: "Newsletter not found" });
        }

        res.status(200).json({
            message: "Email has been successfully updated",
            newsletter: updatedNewsletter
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.errors[0] });
        }
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.findOne = async (req, res) => {
    try {
        const {email} = req.body

        await newLetterSchema.validate({email})

        const findOne = await NewsletterModel.findOne({email})

        if (!findOne) {
            return res.status(404).json({ message: "Newsletter not found" });
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