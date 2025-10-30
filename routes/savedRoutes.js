const express = require("express");
const { toggleSavedItem,getSavedItems } = require("../controllers/savedController");
const { isAuthenticatedUser, AuthorizeRoles } = require("../middlerware/auth");
const Router = express.Router();


Router
.post('/toggle-save-item/:id',isAuthenticatedUser,AuthorizeRoles('user'),toggleSavedItem)
.get('/get-saved-item',isAuthenticatedUser,AuthorizeRoles('user'),getSavedItems)

module.exports = Router;