const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.get("/", userController.getAllUsers);

router.post("/", userController.createUser);

router.get("/deleted", userController.getDeletedUsers);

router.delete("/deleteall", userController.deleteAllUsers);

router.get("/:id", userController.getOneUser);

router.put("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

module.exports = router;
