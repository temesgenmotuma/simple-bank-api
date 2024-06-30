const Joi = require("joi");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const { name, email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        accounts: {
          create: {
            balance: 200,
          },
        },
      },
      include: {
        accounts: true,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    // console.log(error);
    res.status(400).json({ message: error.message });
  }
};

exports.getOneUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        accounts: true,
      },
    });

    if (!user) return res.status(404).send({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.messagge });
  }
};

exports.updateUser = async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const { name, email, password } = req.body;
  try {
    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        name,
        email,
        password,
      },
      include: {
        accounts: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    /*   //handle the transfer that references the account
    //if the transfers is from the account the account to be deleted update the fromAccountId foreign key 
    //if transfers is to the account to be deleted update the toAccountId foreign key
    // if () {
      
    // }
    await prisma.transfer.update({
      where:{
        toAccount: 
      }
    });
    await prisma.account.delete({
      where: {
        userId: userId,
      },
    }); */

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    res.json({ message: `Deleted user with id ${userId}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
