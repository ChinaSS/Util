/**
 * Created by YiYing on 2014/12/14.
 */
define(['WebUploader','jquery'],function(WebUploader,$){

    var init = function(options){
        var settings = {
            remove:function(){},
            uploadSuccessExt:function(file, response){}
        };
        return new SimpleUpload($.extend(settings,options)).render();
    };

    /**
     * 简单附件上传对象
     * @param settings
     * @constructor
     */
    function SimpleUpload(settings){
        this.$img       = null;                 //附件上传组件图标
        this.$upload    = null;                 //上传图标DOM对象
        this.$remove    = null;                 //删除图标DOM对象
        this.settings   = settings;
    }

    /**
     * 渲染附件上传组件
     */
    SimpleUpload.prototype.render = function () {
        var html = '<div class="cs-sUpload">'+
                        '<div>'+
                            '<input type="text" class="form-control">'+
                        '</div>'+
                      /*'<i class="fa fa-cloud-upload"></i>'+
                        '<i class="fa fa-upload""></i>'+
                        '<i class="fa fa-times"></i>'+*/
                    '</div>';
        this.$container = $(html);
        var _this = this;
        this.$img       = $('<i class="fa fa-cloud-upload"></i>');
        this.$upload    = $('<i class="fa fa-upload" title="上传"></i>').bind('click',function(){_this.startUpload()});
        this.$remove    = $('<i class="fa fa-times" title="删除"></i>').bind('click',function(){_this.remove()});
        this.$container.append(this.$img).append(this.$upload).append(this.$remove);
        //添加附件上传组件到指定位置
        var placeAt     = this.settings.placeAt;
        var $placeAt    = typeof(placeAt)=="string" ? $("#"+placeAt) : $(placeAt);
        $placeAt.append(this.$container);

        //初始化WebUploader
        this.webUploader    = InitUploader(this,this.settings);

        return this;
    };

    /**
     * 开始上传附件
     */
    SimpleUpload.prototype.startUpload = function(){
        this.webUploader.upload();
    };

    /**
     * 删除附件
     */
    SimpleUpload.prototype.remove = function(){
        this.$container.find("input")[0].value = "";
        //重置uploader。目前只重置了队列。
        this.webUploader.reset();
        //显示隐藏控制
        this.$img.show();
        this.$upload.hide();
        this.$remove.hide();
        this.settings.remove.apply(this);
    };

    var InitUploader = function(simpleUpload,settings) {
        var def = {
            // swf文件路径
            swf: getStaticPath() + 'modules/webuploader/Uploader.swf',
            // 文件接收服务端。
            server: getServer() +"/file/upload",
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: {
                id:simpleUpload.$container[0].firstChild,
                multiple:false
            },
            // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
            resize: false
        };

        var uploader = WebUploader.create($.extend(def,settings));



        /**
         * 当文件被加入队列以后触发。
         */
        uploader.on( 'fileQueued', function( file ) {
            simpleUpload.$container.find("input")[0].value = file.name;
            //显示删除和上传图标
            simpleUpload.$img.hide();
            simpleUpload.$upload.show();
            simpleUpload.$remove.show();
        });
        /**
         * 当一批文件添加进队列以后触发。
         */
        uploader.on( 'filesQueued', function( files ) {

        });
        /**
         * 当开始上传流程时触发。
         */
        uploader.on( 'uploadStart', function( file ) {

        });
        /**
         * 上传过程中触发，携带上传进度。
         */
        uploader.on( 'uploadProgress', function( file, percentage ) {

        });
        /**
         * 当文件上传出错时触发。
         */
        uploader.on( 'uploadError', function( file, reason ) {

        });
        /**
         * 当文件上传成功时触发。
         */
        uploader.on( 'uploadSuccess', function( file, response ) {
            simpleUpload.settings.uploadSuccessExt.apply(simpleUpload,[file, response]);
        });
        /**
         * 不管成功或者失败，文件上传完成时触发。
         */
        uploader.on('uploadComplete',function(file){

        });

        return uploader;
    };

    return {
        init:init
    }
});