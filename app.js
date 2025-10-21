const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors({origin: ["https://mmx10d-storage.onrender.com","https://mmx10d-storage.onrender.com/"]}));

const port = 8893;

const domains = ["https://mmx10d-storage.onrender.com/","http://localhost:8893/"]
const website = domains[0];

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"index.html"));
})

app.get("/create",(req,res)=>{
    let name = req.query.name;
    if(name.slice(-4)!==".txt"){
	name+=".txt";
    }
    if(fs.existsSync(`data/${name}`)){
	res.send("الملف موجود مسبقا.. قم بتغيير الاسم");
	return
    }
    try{
	fs.writeFileSync(`data/${name}`, "");
        res.send("تم انشاء الملف");
   }catch{}
})
app.get("/delete",(req,res)=>{
    let name = req.query.name;
    try{
	fs.unlinkSync(`data/${name}`);
	res.send("<h1>تم حذف الملف</h1><script>setTimout(()=>location.path='',3000)</script>");
   }catch{}
})
app.get("/read",(req,res)=>{
    let name = req.query.name;
    try{
	let read = fs.readFileSync(`data/${name}`, "utf8") || "لايوجد بيانات داخل الملف";
	res.send(read);
    }catch{}
})
app.get("/edit",(req,res)=>{
    let name = req.query.name;
    try{
        let read = fs.readFileSync(`data/${name}`, "utf8");
	res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Page title</title>
</head>
<body>
    <textarea id="text">${read}</textarea>
    <button id="save_btn">حفظ</button>
<script>
    let text = document.querySelector("#text");
    let save_btn = document.querySelector("#save_btn");
    save_btn.onclick= ()=>{
        fetch("${website}"+"editfile?name="+"${name}"+"&data="+text.value)
        .then(_=>{
            alert("تم التعديل");
            location.reload()
        })
        .catch(_=>{
            alert("لم يتم تعديل الملف")
            location.reload();
        })
    };
</script>
</body>
</html>`);
    }catch{}
});
app.get("/editfile",(req,res)=>{
    let name = req.query.name;
    let data = req.query.data;
    try{
        fs.writeFileSync(`data/${name}`,data);
        res.send("تم تعديل البيانات");
    }catch{}
})
app.get("/link",(req,res)=>{
    let name = req.query.name;
    try{
	let save_fetch = `fetch(\`${website}save?name=${name}&data=yourdata\`)//send text response`;
	let get_fetch = `fetch(\`${website}get?name=${name}\`)\n.then(res => res.json())\n.then(res => {\n\t\n})//send object response`;
	let savedelete_fetch = `fetch(\`${website}deletesave?name=${name}&data=yourdata\`)//didn't send any response`;
        let saveedit_fetch = `fetch(\`${website}editsave?name=${name}&olddata=yourolddata&newdata=yournewdata\`)//didn't send any response`;
        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>link</title>
    <style>
        body{
            display:flex;
            flex-direction: column;
            justify-content: center;
            background: black;
            color: white;
        }
        #finish {
            background: red;
            color: white;
            border: 1px black solid
        }
        code {
            border: 1px solid black;
            padding: 10px;
            background: rgb(30,120,30);
            color: white;
        }
    </style>
</head>
<body>
    <code id="save_value">${save_fetch}</code>
    <button id="copy_save_btn">نسخ</button>
    <hr>
    <code id="get_value">${get_fetch}</code>
    <button id="copy_get_btn">نسخ</button>
    <hr>
    <code id="remove_value">${savedelete_fetch}</code>
    <button id="copy_remove_btn">نسخ</button>
    <hr>
    <code id="edit_value">${saveedit_fetch}</code>
    <button id="copy_edit_btn">نسخ</button>
    <hr>
    <button id="finish">انهاء</button>
    
<script>
    const copy_save_btn = document.querySelector("#copy_save_btn");
    const copy_remove_btn = document.querySelector("#copy_remove_btn");
    const copy_edit_btn = document.querySelector("#copy_edit_btn")
    const copy_get_btn = document.querySelector("#copy_get_btn");
    copy_save_btn.onclick= ()=>{
        navigator.clipboard.writeText(save_value.innerText);
        alert("تم النسخ");
    }
    copy_remove_btn.onclick= ()=>{
        navigator.clipboard.writeText(remove_value.innerText);
        alert("تم النسخ");
    }
    copy_get_btn.onclick= ()=>{
        navigator.clipboard.writeText(get_value.innerText);
        alert("تم النسخ");
    }
    copy_edit_btn.onclick= ()=>{
        navigator.clipboard.writeText(edit_value.innerText);
        alert("تم النسخ");
    }
    finish.onclick = ()=>{
        location.reload();
    }
</script>
</body>
</html>`);
   }catch{}
})
app.get("/save", cors(), (req,res)=>{
    let name = req.query.name;
    let data = req.query.data;
    try{
	let read = fs.readFileSync(`data/${name}`)
	if(read.includes(data)){
    	    res.send("البيانات موجودة مسبقا");
	    return
        }
        fs.appendFileSync(`data/${name}`, data + ",");
	res.send("تم حفظ البيانات");
    }catch{}
})
app.get("/get", cors(), (req,res)=>{
    let name = req.query.name;
    try{
	let read = fs.readFileSync(`data/${name}`, "utf8");
	read = read.split(",");
	read.pop();
	res.send(read);
    }catch{}
})
app.get("/deletesave", cors(), (req,res)=>{
    let name = req.query.name;
    let data = req.query.data;
    try{
	let read = fs.readFileSync(`data/${name}`, "utf8");
	let part1 = read.slice(0,read.indexOf(data));
        let part2 = read.slice(read.indexOf(data)+data.length);
	fs.writeFileSync(`data/${name}`, part1+part2);
	read = fs.readFileSync(`data/${name}`, "utf8");
	if(read[0]==","){
	    read = read.slice(1);
	    fs.writeFileSync(`data/${name}`, read);
        }
    }catch{}
})
app.get("/editsave", cors(), (req,res)=>{
    let name = req.query.name;
    let new_data = req.query.newdata;
    let old_data = req.query.olddata;
    try{
        let read = fs.readFileSync(`data/${name}`, "utf8");
        let part1 = read.slice(0,read.indexOf(old_data));
        let part2 = read.slice(read.indexOf(old_data)+old_data.length);
        fs.writeFileSync(`data/${name}`, part1+new_data+part2);
        read = fs.readFileSync(`data/${name}`, "utf8");
    }catch{}
})
app.get("/get_files",(req,res)=>{
    try{
	let files = fs.readdirSync("data");
	res.send(files);
    }catch{}
})
app.listen(port,()=>
{
    console.log(`app run on ${port}`);
})
