const router = require('koa-router')()
const fs = require('fs')
// 处理前缀
router.prefix('/static')

router.post('/upload', async (ctx, next) => {
  const files = ctx.request.files;//获取上传文件
  fs.writeFileSync("files.txt", JSON.stringify(ctx.request.files))
  Object.keys(files).forEach((item) => {
    const file = files[item]
    console.log(item)
    const reader = fs.createReadStream(file.path);//创建可读流
    //const ext = file.name.split('.').pop();//获取上传文件扩展名
    const name = file.name;
    // 指定写出流的路径。这里可以用唯一id替换掉文件名，并将id与文件名映射关系在mysql中进行管理，避免出现文件重复带来的问题
    const upStream = fs.createWriteStream(`public\\file\\${name}`);
    reader.pipe(upStream);
  });

  return ctx.body = { "iret": 0, "msg": "upload succ" };
})

router.get('/download', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
