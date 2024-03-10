console.log("START!\n\n")

const testObj = {
    isOk: true,
    obj_cnts: 1
}

const p1 = new Promise((res, rej) => {
    if(!testObj.isOk) res(testObj)
    else rej("error")
})



console.log(p1)

p1
.then(
    suc => console.log(suc),
    err => console.log(err)
)
.catch(err => console.log("error happend"))

console.log(p1)