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
      where: {
        deletedAt: null,
      },
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
        deletedAt: null,
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
  const userId = req.params.id;

  try {
    await prisma.$transaction(async (prisma) => {
      const userExists = await prisma.user.findUnique({
        where: {
          id: userId,
          deletedAt: null,
        },
      });

      if (!userExists)
        throw {
          message: "The user wasn't found",
          code: 404,
        };

      const user = await prisma.user.update({
        where: {
          id: userId,
          deletedAt: null,
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
    });
  } catch (error) {
    if (error.code === 404) res.status(404).json({ message: error.message });
    else {
      res.status(500);
      console.log(error);
    }
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
          deletedAt: null,
        },
      });

      if (!user)
        throw {
          message: "User not found",
          code: 404,
        };

      await prisma.user.update({
        where: {
          id: userId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await prisma.account.update({
        where: {
          userId: userId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    });

    res.json({
      message: "User and their accounts marked as deleted successfully",
    });
  } catch (error) {
    if (error.code === 404) res.status(404).json({ message: error.message });
    else {
      res.status(500);
      console.log(error);
    }
  }
};

exports.getDeletedUsers = async (req, res) => {
  try {
    const deletedUsers = await prisma.user.findMany({
      where: {
        NOT: {
          deletedAt: null,
        },
      },
      include: {
        accounts: true,
      },
    });
    res.status(200).json(deletedUsers);
  } catch (error) {
    res.status(500).send({ errmessage: error.message });
    console.log(error);
  }
};

exports.deleteAllUsers = async (req, res) => {
  try {
    await prisma.user.deleteMany();
    res.json("Deleted all users");
  } catch (err) {
    res.status(500);
    console.log(err);
  }
};
