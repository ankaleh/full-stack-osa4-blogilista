const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema( {
  kayttajatunnus: { type: String, unique: true, required: true, minlength: 3 },
  nimi: String,
  salasanaHash: String,
  blogit: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
})

userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.salasanaHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User