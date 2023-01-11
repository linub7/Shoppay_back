const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');

exports.saveCartToDb = asyncHandler(async (req, res, next) => {
  const {
    body: { cart },
    user,
  } = req;

  let products = [];
  const usr = await User.findById(user.id);

  const alreadyExistedCart = await Cart.findOne({ user: usr._id });
  if (alreadyExistedCart) {
    await alreadyExistedCart.remove();
  }
  for (let i = 0; i < cart.length; i++) {
    const dbProduct = await Product.findById(cart[i]._id);
    const subProduct = dbProduct.subProducts[cart[i].style];
    let tempProduct = {};
    tempProduct.name = dbProduct.name;
    tempProduct.product = dbProduct._id;
    tempProduct.color = {
      color: cart[i].color.color,
      image: cart[i].color.image,
    };
    tempProduct.image = subProduct.images[0].url;
    tempProduct.qty = Number(cart[i].qty);
    tempProduct.size = cart[i].size;
    let price = Number(
      subProduct.sizes.find((el) => el.size === cart[i].size).price
    );
    tempProduct.price =
      subProduct.discount > 0
        ? (price - price / Number(subProduct.discount)).toFixed(2)
        : price.toFixed(2);

    products.push(tempProduct);
  }
  let cartTotal = 0;
  for (let index = 0; index < products.length; index++) {
    const element = products[index];
    cartTotal = cartTotal + element.price * element.qty;
  }
  await new Cart({
    products,
    user: usr._id,
    cartTotal: cartTotal.toFixed(2),
  }).save();

  return res.status(201).json({
    status: 'success',
    message: 'add cart to db successfully done.',
  });
});
