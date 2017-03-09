var Shopcart = require('../models/shopcart')
var Product = require('../models/product')
var _ = require('underscore')


// 购物清单
exports.detail = function(req,res){
	var user = req.session.user

	if(!user){
		if(!req.session.cart) req.session.cart = []
		var session_cart = req.session.cart
		res.render('shopcart',{
			title: 'shopping cart' + ' | IMOOC',
			product: session_cart,
			cart_goods_num: session_cart.length
		})
	}else{
		// populate多层查找
		Shopcart
			.findOne({'uid':user._id})
			.populate({
				path: 'products.product',
				model: 'Product',
				populate: {
					path: 'category',
					select: 'name',
					model: 'Category'
				}
			})
			.exec(function(err, shopcart){
				if(err) console.log(err)

				// console.log(shopcart.products)
				if(shopcart){
					var cart_goods_num = shopcart.products.length
					res.render('shopcart',{
						title: 'dfsdfsdfsdf' + ' | IMOOC',
						product: shopcart.products,
						cart_goods_num: shopcart.products.length
					})
				}else{
					res.render('shopcart',{
						title: 'dfsdfsdfsdf' + ' | IMOOC',
						product: [],
						cart_goods_num: 0
					})
				}
			})

	}
}

// 添加购物车
exports.add = function(req,res){
	var user = req.session.user
	var cartinfo = req.body
	var cart_goods_num = 0
	if(!user){
		// 如果用户不存在新建个临时购物表
		if(!req.session.cart) req.session.cart = []
		// 判断下面临时购物车下是否有重复
		var has_same_pid = false
		for(var i=0;i<req.session.cart.length;i++){
			if(req.session.cart[i].product._id==req.body.product){
				has_same_pid = true
				break
			}
		}
		if(!has_same_pid){
			// 新增
			Product
				.findOne({_id:cartinfo.product})
				.populate('category','name')
				.exec(function(err,product){
					if(err) console.log(err)
					var newproduct = {
						'quantity': cartinfo.quantity,
						'product': product
					}
					req.session.cart.push(newproduct)
					return res.json({success:2,cart_goods_num:req.session.cart.length})
				})

		}else{
			// 不再重复增加返回1
			return res.json({success:1})
		}

	}else{
		Shopcart.findOne({'uid':user._id},function(err,shopcart){
			if(err) console.log(err)
			var check_same_id = false
			for(var i=0; i<shopcart.products.length; i++){
				if(shopcart.products[i].product == cartinfo.product){
					check_same_id = true
				}
			}
			console.log(check_same_id)
			if(check_same_id){
				return res.json({success:1})
			}else{
				shopcart.products.push(cartinfo)
				shopcart.save(function(err){
					console.log(err)
					res.json({success:2,cart_goods_num:shopcart.products.length})
				})
			}

		})

	}

}

// 删除购物车
exports.del = function(req,res){
	var user = req.session.user
	var id = req.query.id

	if(!user){
		console.log(id)
		var cart = req.session.cart
		for(var i=0; i<cart.length; i++){
			if(cart[i].product._id == id){
				req.session.cart.splice(i, 1)
				res.json({success:1,cart_goods_num:cart.length})
				return false
			}
		}
		res.json({success:0})
	}else{
		Shopcart.findOne({'uid':user._id},function(err,shopcart){
			if(err) console.log(err)
			if(shopcart){

				for(var i=0; i<shopcart.products.length; i++){
					// 查找购物车里对应的product id,并删除
					if(shopcart.products[i].product==id){
						shopcart.products.splice(i,1)
						break
					}
				}

				shopcart.save(function(err){
					if(err) console.log(err)
					res.json({success:1,cart_goods_num:shopcart.products.length})
				})
			}else{
				res.json({success:0})
			}
		})

		

	}

}

// 比对购物车
exports.matchcart = function(req,res,next){
	var s_shopcart = req.session.cart
	var user = req.session.user

	if(s_shopcart){
	// if(user){
		Shopcart
			.findOne({'uid':user._id})
			.populate({
				path: 'products.product',
				model: 'Product',
				populate: {
					path: 'category',
					select: 'name',
					model: 'Category'
				}
			})
			.exec(function(err, shopcart){
				if(err) console.log(err)
				if(!shopcart){
					console.log('新增并合并缓存数据')
					var newShopcart = new Shopcart({"uid":user._id,"products":[]})
					// newShopcart = _.extend(newShopcart, s_shopcart)
					if(s_shopcart){
						for(var i=0; i<s_shopcart.length; i++){
							newShopcart.products.push(s_shopcart[i])
						}
					}
					// console.log()
					// console.log(newShopcart)
					delete req.session.cart
					newShopcart.save(function(err){
						if(err) console.log(err)
					})
				}else{
					console.log('合并缓存数据')

					var products = shopcart.products

					for(var i=0; i<s_shopcart.length; i++){
						var is_same_id = false
						for(var j=0; j<products.length; j++){
							if(s_shopcart[i].product._id==products[j].product._id){
								is_same_id = true
								break
							}
						}
						if(!is_same_id){
							products.push(s_shopcart[i])
						}
					}
					console.log(products)

					delete req.session.cart
					shopcart.save(function(err){
						if(err) console.log(err)
					})

				}
			})

	}
	// next()
}