const mongoClient=require('mongodb').MongoClient

const state={
    db:null
}

module.exports.connect=function(done){
    const url='mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1'
    const dbname='watermelon'

    mongoClient.connect(url,(err,data)=>{
        if(err){
        return done(err)
        }
        state.db=data.db(dbname)

        done()
    })
}

module.exports.get=function(){
    return state.db
}