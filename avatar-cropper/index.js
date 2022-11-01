const debounce = function(fn, delay = 3000) {
  let timer = null
  const _debounce = function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
  return _debounce
}
Component({
  properties: {
    imageUrl:{
      type:String,
      value:''
    },
    show:{
      type:Boolean,
      value:false
    }
  },
  data: {
    systemInfo:wx.getSystemInfoSync()
  },
  lifetimes:{
    ready(){
      this.context = wx.createCanvasContext('myCanvas', this);
    }
  },
  methods: {
    // 初始化图片大小
    onImageLoad:function(e){
      let { width, height } = e.detail, h = 300, w = 300, x = 0, y = 0;
      if(width < height){
        h = height * w / width;
        y = -(h - 300)/2;
      }
      if(height < width){
        w = width * h / height;
        x = -(w - 300)/2;
      }
      this.x = x;
      this.y = y;
      this.scale = 1;
      this.setData({image_w:w,image_h:h,original_w:width,original_h:height,x,y})
      this.getDramParams();
    },
    getDramParams:function(){
      let { original_w, original_h, image_w, image_h } = this.data, { x, y, scale } = this;
      console.log(x,y,scale)
      let sourceX = Math.abs(original_h * x /image_h), sourceY = Math.abs(original_w * y / image_w);
      this.context.drawImage(this.properties.imageUrl,sourceX/scale,sourceY/scale,Math.min(original_h,original_w)/scale,Math.min(original_h,original_w)/scale,0,0,300,300);
      this.context.draw()
    },
    // 获取图片
    getImage:function(){
      wx.canvasToTempFilePath({
        canvasId:'myCanvas',
        success:res=>{
          console.log(res)
          this.setData({image:res.tempFilePath,show:false})
          this.triggerEvent('returnImageUrl', {
            imageUrl: res.tempFilePath
          })
        }
      }, this)
    },
    // 拖动图片
    onMove:function(e){
      console.log(e)
      let { x, y } = e.detail;
      this.x = x;
      this.y = y;
      debounce(this.getDramParams(),300)
    },
    onScale:function(e){
      let { x, y, scale } = e.detail;
      this.x = x;
      this.y = y;
      this.scale = scale;
      debounce(this.getDramParams(),300)
    },
    cancel:function(e){
      this.setData({show:false})
    }
  }
})