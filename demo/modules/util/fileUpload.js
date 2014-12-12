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
            pick: ''                                                        //上传按钮所在位置
        };
        return new Upload($.extend(settings,options)).render();
    };


    /********************************Upload对象**********************************/
    /**
     * 附件上传组件对象
     * @param settings
     */
    function Upload(settings){
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
        var placeAt = this.settings.placeAt;
        var $placeAt = typeof(placeAt)=="string" ? $("#"+placeAt) : $(placeAt);
        $placeAt.append(this.container);

        //设置添加按钮
        this.settings.pick = this.container.find("li:contains('添加')");
        //初始化WebUploader
        InitUploader(this,this.settings);
    };

    /**
     * 渲染操作栏
     */
    Upload.prototype.renderToolbar = function(){
        var html = '<div class="cs-upload-toobar">'+
                        '<ul>'+
                            '<li class="first"><a><i class="fa fa-plus-circle">&nbsp;</i>添加</a></li>'+
                            '<li><a><i class="fa fa-trash-o">&nbsp;</i>删除</a></li>'+
                        '</ul>'+
                    '</div>';
        this.$toolbar = $(html);

        //把操作栏添加到上传组件面板中
        this.container.append(this.$toolbar);
    };

    /**
     * 渲染附件列表Table
     */
    Upload.prototype.renderContent = function(){
        var html = '<table class="table table-hover">'+
                        '<tr>'+
                            '<td style="width:30px"><input type="checkbox"></td>'+
                            '<td>附件名称</td>'+
                            '<td>上传日期</td>'+
                            '<td>大小</td>'+
                            '<td>状态</td>'+
                        '</tr>'+
                        /*'<tr>'+
                            '<td><input type="checkbox"></td>'+
                            '<td>客户调查表.doc</td>'+
                            '<td>2014-11-11</td>'+
                            '<td>19.4M</td>'+
                            '<td>已上传</td>'+
                        '</tr>'+*/
                    '</table>';
        this.$table = $(html);
        this.container.append(this.$table);
    };

    /**
     * 渲染状态栏
     */
    Upload.prototype.renderStatus = function(){
        var html = '<div class="cs-upload-status"></div>';
        this.$status = $(html);
        this.container.append(this.$status);
    };


    /********************************File对象**********************************/
    /**
     * 文件对象
     * @param upload        文件上传组件对象
     * @param file          Webuploader中的file对象
     * @constructor
     */
    function File(upload,file){
        this.Upload = upload;
        this.file   = file;

        this.render();
    }

    /**
     * 渲染文件行
     */
    File.prototype.render = function(){
        var file = this.file;
        var html = '<tr>'+
                        '<td><input type="checkbox"></td>'+
                        '<td>'+ file.name +'</td>'+
                        '<td>'+ new Date().format("yyyy-MM-dd")  +'</td>'+
                        '<td>'+ WebUploader.Base.formatSize(file.size, 2, ['B', 'K', 'M', 'G', 'TB'] ) +'</td>'+
                        '<td>待上传</td>'+
                    '</tr>';
        this.Upload.$table.append(html);
    };

    File.prototype.del  =function(){

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
            //getFileFromList(files.name,queuedFiles);
            for(var i= 0,file;file=files[i++];){
                queuedFiles.push(new File(Upload,file));
            }
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
            //$("#progress_"+file.id).css( 'width', percentage * 100 + '%' );
        });
        /**
         * 当文件上传出错时触发。
         */
        uploader.on( 'uploadError', function( file, reason ) {
            /*$("#progress_"+file.id).parent().hide();
            $("#status_"+file.id).css("color","#C00").html("上传失败").show();
            setOperation(file.id,['icon_att_del']);*/
        });
        /**
         * 当文件上传成功时触发。
         */
        uploader.on( 'uploadSuccess', function( file, response ) {
            /*$("#progress_"+file.id).parent().hide();
            $("#status_"+file.id).css("color","#999999").html("完成").show();
            setOperation(file.id,['icon_att_finish']);
            file.size = WebUploader.Base.formatSize(file.size, 2, ['B', 'K', 'M', 'G', 'TB']);
            file.path = file.name;
            uploader["successList"].push(file);*/
        });
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