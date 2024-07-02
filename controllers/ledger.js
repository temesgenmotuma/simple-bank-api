const Joi = require("joi");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const transferSchema = Joi.object({
  fromAccountId: Joi.string().required(),
  toAccountId: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

exports.getAccountBalance = async (req, res) => {
  const accountId = req.query.accountId;
  try {
    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
        deletedAt: null,
        user: {
          deletedAt: null,
        },
      },
      include: {
        user: true,
      },
    });

    if (!account) return res.status(404).json({ message: "Account not found" });

    res.json({
      name: account.user.name,
      id: account.user.id,
      balance: account.balance,
    });
  } catch (error) {
    res.status(500);
    console.log(error);
  }
};

exports.postMoneyTransfer = async (req, res) => {
  const { error } = transferSchema.validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const { fromAccountId, toAccountId, amount } = req.body;

  try {
    const fromAccount = await prisma.account.findUnique({
      where: {
        id: fromAccountId,
        deletedAt: null,
        user: {
          deletedAt: null,
        },
      },
      include: {
        user: true,
      },
    });

    if (!fromAccount)
      return res.status(404).json({ message: "Sender account not found" });

    const toAccount = await prisma.account.findUnique({
      where: {
        id: toAccountId,
        deletedAt: null,
        user: {
          deletedAt: null,
        },
      },
      include: {
        user: true,
      },
    });

    if (!toAccount)
      return res.status(404).json({ message: "Recipient account not found" });

    await prisma.$transaction(async (prisma) => {
      const updatedFromAccount = await prisma.account.update({
        where: {
          id: fromAccountId,
        },
        data: {
          balance: { decrement: amount },
        },
      });

      if (updatedFromAccount.balance < 0) {
        throw new Error(
          `The sender doesn't have enough to send Birr ${amount}`
        );
      }

      const updadtedToAccount = await prisma.account.update({
        where: {
          id: toAccountId,
        },
        data: {
          balance: {
            increment: amount,
          },
          transfersTo: {
            create: {
              amount: amount,
              fromAccountId: fromAccountId,
            },
          },
        },
      });

      res.json({ sender: updatedFromAccount, recipient: updadtedToAccount });
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
    // console.log(error);
  }
};

exports.getTransferHistory = async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        fromAccount: true,
        toAccount: true,
      },
    });
    res.json(transfers);
  } catch (error) {
    res.status(500);
    console.log(error);
  }
};

exports.getTransferInfo = async (req, res) => {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: req.params.id },
      include: {
        fromAccount: true,
        toAccount: true,
      },
    });
    if (!transfer) return res.status(404).send("Transfer not found");
    res.send(transfer);
  } catch (error) {
    res.status(500);
    console.log(error);
  }
};
