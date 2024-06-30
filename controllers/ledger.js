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
      },
    });
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json({ balance: account.balance });
  } catch (error) {
    res.send(400).json({ message: error.message });
  }
};

exports.postMoneyTransfer = async (req, res) => {
  const { error } = transferSchema.validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const { fromAccountId, toAccountId, amount } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      //decrement amount from the sender
      const fromAccount = await prisma.account.update({
        where: {
          id: fromAccountId,
        },
        data: {
          balance: { decrement: amount },
          transfersFrom: {
            create: {
              amount: amount,
              toAccountId: toAccountId,
            },
          },
        },
      });

      //verify that the sender's balance didn't go below zero
      if (fromAccount.balance < 0) {
        throw new Error(
          `The sender doesn't have enough to send Birr ${amount}`
        );
      }

      //increment the recipient's balance by amount
      const toAccount = await prisma.account.update({
        where: {
          id: toAccountId,
        },
        data: {
          balance: {
            increment: amount,
          },
          // transfersTo
        },
      });
      return { fromAccount, toAccount };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

exports.getTransferHistory = async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany();
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransferInfo = async (req, res) => {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: req.params.id },
    });
    if (!transfer) return res.status(404).send("Transfer not found");
    res.send(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
