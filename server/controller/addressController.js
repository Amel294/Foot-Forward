const Address = require("../model/address")
const userDB = require("../model/userDB")

exports.checkout =async(req, res) => {
    const id = req.session.user.id
      const addresses = await Address.find({ userId: req.session.user.id });
      const user = await userDB.findOne({ _id: id });
  
      // Render the 'userDashboard' EJS template and pass the addresses to it.
      res.render('user/checkout', { addresses: addresses,user: user });
  }