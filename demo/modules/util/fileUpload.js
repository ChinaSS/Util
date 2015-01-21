define(['WebUploader','jquery','css!UtilDir/css/util.css','css!WebUploaderCss'],function(WebUploader){

    /**
     * 附件上传控件初始化
     * @param options
     */
    var init = function(options){
        var settings = {
            type:"simple",
            placeAt:"",                                                     //附件上传组件所放位置
            auto: false,                                                    //是否自动上传
            swf: getStaticPath() + 'modules/webuploader/Uploader.swf',      //flash地址
            server: getServer() +"/file/upload",
            formData:{},                                                    //向服务器额外发送的数据
            pick: '',                                                       //上传按钮所在位置
            uploadSuccessExt:function(file, response){}                     //上传成功扩展
        };

        return new Upload($.extend(settings,options)).render();
    };


    /********************************Upload对象**********************************/
    /**
     * 附件上传组件对象
     * @param settings
     */
    function Upload(settings){
        this.webUploader    = null;         //WebUploader对象
        this.queuedFiles    = [];           //待上传文件数组
        this.savedFiles     = [];           //已上传文件数组
        this.$container     = "";           //整个上传组件DOM对象
        this.$toolbar       = "";           //操作栏DOM对象
        this.$table         = "";           //文件列表DOM对象
        this.$status        = "";           //状态栏DOM对象
        this.settings = settings;
    }
    /**
     * 渲染附件上传组件
     */
    Upload.prototype.render = function(){
        this.container      = $('<div class="cs-upload"></div>');
        this.renderToolbar();
        this.renderContent();
        this.renderStatus();

        //添加附件上传组件到指定位置
        var placeAt     = this.settings.placeAt;
        var $placeAt    = typeof(placeAt)=="string" ? $("#"+placeAt) : $(placeAt);
        $placeAt.append(this.container);

        //设置添加按钮
        this.settings.pick  = this.container.find("li:contains('添加')");
        //初始化WebUploader
        this.webUploader    = InitUploader(this,this.settings);

        //渲染已上传的附件
        this.renderSavedFiles();

        return this;
    };

    /**
     * 渲染操作栏
     */
    Upload.prototype.renderToolbar = function(){
        var html = '<div class="cs-upload-toobar">'+
                        '<ul>'+
                            '<li class="first"><a><i class="fa fa-plus-circle">&nbsp;</i>添加</a></li>'+
                            /*'<li><a><i class="glyphicon glyphicon-upload">&nbsp;</i>开始上传</a></li>'+*/
                        '</ul>'+
                    '</div>';
        this.$toolbar = $(html);
        var _this = this;
        //添加上传事件
        var $startUpload = $('<li><a><i class="fa fa-cloud-upload">&nbsp;</i>开始上传</a></li>').bind('click',function(){
            _this.webUploader.upload();
        });
        this.$toolbar.find("ul").append($startUpload);

        //把操作栏添加到上传组件面板中
        this.container.append(this.$toolbar);
    };

    /**
     * 渲染附件列表Table
     */
    Upload.prototype.renderContent = function(){
        var html = '<table class="table table-hover">'+
                        '<tr>'+
                            /*'<td style="width:30px"><input type="checkbox"></td>'+*/
                            '<td>附件名称</td>'+
                            '<td>上传日期</td>'+
                            '<td>大小</td>'+
                            '<td>状态</td>'+
                            '<td>操作</td>'+
                        '</tr>'+
                    '</table>';
        this.$table = $(html);
        this.container.append(this.$table);
    };

    /**
     * 渲染已上传的附件
     * @param files
     */
    Upload.prototype.renderSavedFiles = function(files){
        var data = files || this.settings.data;
        if(data.length){
            for(var i= 0,file;file=data[i++];){
                this.savedFiles.push(new File(this,this.webUploader,file,true));
            }
        }
    };

    /**
     * 渲染状态栏
     */
    Upload.prototype.renderStatus = function(){
        var html = '<div class="cs-upload-status"></div>';
        this.$status = $(html);
        this.container.append(this.$status);
    };

    /**
     * 附件控件清空
     */
    Upload.prototype.clear = function(){
        this.queuedFiles    = [];
        this.savedFiles     = [];
        this.webUploader.reset();
        this.$table.find("tr").not(":first").remove();
    };

    /**
     * 设置状态栏内容
     */
    Upload.prototype.setStatus = function(msg){
        this.$status.html(msg);
    };


    /********************************File对象**********************************/
    /**
     * 文件对象
     * @param upload        文件上传组件对象
     * @param webUploader   Webuploader对象
     * @param file          Webuploader中的file对象，包含文件名称、大小等信息
     * @param saved         标识是新上传还是已上传的文件
     * @constructor
     */
    function File(upload,webUploader,file,saved){
        this.Upload     = upload;               //附件上传组件对象
        this.webUploader= webUploader;          //WebUploader对象
        this.file       = file;                 //Webuploader中的file对象
        this.saved      = saved;                //标识当前文件的状态已上传
        this.responseData= null;                 //文件所对应的后端数据信息
        this.$tr        = "";                   //文件行DOM对象
        this.$status    = "";                   //状态DOM对象
        this.$operation = null;                 //操作DOM对象
        this.$del       = null;
        this.$download  = null;
        saved ? this.renderSavedFiles() : this.render();
    }

    /**
     * 渲染文件行
     */
    File.prototype.render = function(){
        var file = this.file;
        var html = '<tr>'+
                        /*'<td><input type="checkbox"></td>'+*/
                        '<td>'+ file.name +'</td>'+
                        '<td>'+ new Date().format("yyyy-MM-dd")  +'</td>'+
                        '<td>'+ WebUploader.Base.formatSize(file.size, 2, ['B', 'K', 'M', 'G', 'TB'] ) +'</td>'+
                        /*'<td>待上传</td>'+*/
                    '</tr>';
        this.$tr = $(html);

        var _this       = this;
        //状态栏
        this.$status    = $('<td>待上传</td>');
        this.$tr.append(this.$status);
        //操作栏
        this.$operation = $('<td></td>');
        this.$del       = $('<i class="glyphicon glyphicon-trash"></i>').bind('click',function(){_this.remove()});
        this.$download  = $('<i class="fa fa-cloud-download" style="display:none"></i>').bind('click',function(){_this.download()});
        this.$operation.append(this.$del).append('&nbsp;&nbsp;').append(this.$download);
        this.$tr.append(this.$operation);

        this.Upload.$table.append(this.$tr);
        this.Upload.settings.afterRenderFile.apply(this,[this]);
    };
    /**
     * 渲染已经上传的附件，适用于已保存的表单编辑
     */
    File.prototype.renderSavedFiles = function(){
        this.responseData  = this.file.responseData;

        var file = this.file;
        var html = '<tr>'+
                        '<td>'+ file.name +'</td>'+
                        '<td>'+ file.uploadDate +'</td>'+
                        '<td>'+ file.size +'</td>'+
                    '</tr>';
        this.$tr = $(html);

        var _this       = this;
        //状态栏
        this.$status    = $('<td>已上传</td>');
        this.$tr.append(this.$status);
        //操作栏
        this.$operation = $('<td></td>');
        this.$del       = $('<i class="glyphicon glyphicon-trash"></i>').bind('click',function(){_this.remove()});
        this.$download  = $('<i class="fa fa-cloud-download"></i>').bind('click',function(){_this.download()});
        this.$operation.append(this.$del).append('&nbsp;&nbsp;').append(this.$download);
        this.$tr.append(this.$operation);

        this.Upload.$table.append(this.$tr);
        this.Upload.settings.afterRenderFile.apply(this,[this]);
    };

    /**
     * 文件删除
     */
    File.prototype.remove = function(){
        if(this.saved){
            //已上传的文件删除时，调用回调
            this.Upload.settings.delFile.apply(this,[this]);
        }else{
            //从待上传队列中移除
            delFileFormList(this.file.name,this.Upload.queuedFiles);
            this.webUploader.removeFile(this.file,true);
        }
        this.$tr.remove();
    };
    /**
     * 文件下载
     */
    File.prototype.download  =function(){
        this.Upload.settings.downloadFile.apply(this,[this]);
    };



    /********************************WebUploader相关**********************************/
    var InitUploader = function(Upload,settings) {
        var uploader = WebUploader.create(settings);

        /**
         * 当一批文件添加进队列以后触发。
         */
        uploader.on( 'filesQueued', function( files ) {
            //判断待上传列表中是否已经存在相同的待上传附件
            var queuedFiles = Upload.queuedFiles;
            for(var i= 0,file;file=files[i++];){
                //判断是否在待上传列表中
                /*if(getFileFromList(file.name,queuedFiles)){
                    Upload.setStatus(file.name+'已在待上传列表中.');
                    return;
                }*/
                queuedFiles.push(new File(Upload,uploader,file));
            }
        });
        /**
         * 当开始上传流程时触发。
         */
        uploader.on( 'uploadStart', function( file ) {
            //找到当前待上传文件对象
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
            var progress = '<div class="progress">'+
                                '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0;">'+
                                    '0%'+
                                '</div>'+
                            '</div>';
            queuedFile.$status.empty().append(progress);
        });
        /**
         * 上传过程中触发，携带上传进度。
         */
        uploader.on( 'uploadProgress', function( file, percentage ) {
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
            queuedFile.$status.find('div[class="progress-bar"]').css('width', percentage*100 +'%').html((percentage*100).toFixed(2) +'%');
        });
        /**
         * 当文件上传出错时触发。
         */
        uploader.on( 'uploadError', function( file, reason ) {
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
            queuedFile.$status.empty().append('上传失败');
        });
        /**
         * 当文件上传成功时触发。
         */
        uploader.on( 'uploadSuccess', function( file, response ) {
            if(response.status=="200"){
                var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
                //保存后端返回的数据
                queuedFile.responseData = response;
                //添加到已上传列表中
                Upload.savedFiles.push(queuedFile);
                //从待上传中删除
                delFileFormList(file.name, Upload.queuedFiles);

                //设置成功状态
                queuedFile.$status.empty().append('已上传');
                queuedFile.saved = true;

                //显示下载按钮
                queuedFile.$download.show();
                //全部上传完成回调
                //if(uploader.getStats().progressNum==0){
                    Upload.settings.uploadSuccessExt.apply(Upload,[file, response]);
                //}
            }
        });
        /**
         * 不管成功或者失败，文件上传完成时触发。
         */
        uploader.on('uploadComplete',function(file){

        });

        return uploader;
    };

    /********************************内部私有工具方法**********************************/
    /**
     * 根据文件名从指定的数组中找出文件对象
     * @param fileName
     * @param list
     * @returns fileObj
     */
    function getFileFromList(fileName, list) {
        var tmp = null;
        $(list).each(function(index,entry){
            if( entry.file.name.toLowerCase() === fileName.toLowerCase() ) {
                tmp = entry;
            }
        });
        return tmp;
    }

    /**
     * 根据文件名从指定的数组中删除文件对象
     * @param fileName
     * @param list
     */
    function delFileFormList(fileName, list){
        $(list).each(function(index,entry){
            if( entry.file.name.toLowerCase() === fileName.toLowerCase() ) {
                list.splice(index, 1);
                return false;
            }
        });
    }

    /**
     // 对Date的扩展，将 Date 转化为指定格式的String
     // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     // 例子：
     // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
     // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
     * @param fmt
     * @returns {*}
     * @constructor
     */
    Date.prototype.format = function(fmt)
    {
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    };

    return {
        init:init
    }
});