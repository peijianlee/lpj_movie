var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var CategorySchema = new Schema({
	//name为分类名称
	name: String,
	//type仅识别查找类型
	type: String,
	// attributes: String,
	attributes: {
		zh_cn: String,
		en_us: String
	},
	banner: String,
	description: String,
	pid: [{
		type: ObjectId,
		ref: 'Goods'
	}],
	meta:{
		createAt:{
			type: Date,
			default: Date.now()
		},
		updateAt:{
			type: Date,
			default: Date.now()
		}
	}
}, {
	usePushEach: true
})

// 判断保存的数据是否是新增的
CategorySchema.pre('save', function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else{
		this.meta.updateAt = Date.now()
	}

	next()
})

CategorySchema.statics = {
	fetch: function(cb) {
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb)
	},
	findById: function(id, cb){
		return this
			.findOne({_id: id})
			.exec(cb)
	}
}

module.exports = CategorySchema