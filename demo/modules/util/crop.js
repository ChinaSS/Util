/**
 * 图片裁剪
 * by Elva At Css Team
 * 初始化：
 	require(["Crop"], function(Crop){
		//初始化Crop
		var crop = Crop.init({
			//Crop的初始化选择器
			id : "#cropper", 
			//图片提交上传地址
			url : "http://10.12.9.10:8080/WebUploader/file",
			//要裁剪图片的宽、高比例，默认16/9
			ratio : "16/9",
			//图片上传时额外参数
			formData : {
				"aaa" : "aaa",
				"bbb" : "bbb"
			},
			//图片上传成功后回调
			success : null,
			//图片上传失败后回调
			error : null
		});

		//按钮提交
		var oBtn = document.getElementById("submit");
		oBtn.onclick = function() {
			crop.submit();
		}
	})
 */
define(["WebUploader", "css!WebUploaderCss", "Cropper", "css!CropperCss", "css!UtilDir/css/crop.css", "jquery"], function(WebUploader){
	
	var init = function(options) {
		var setting = {
			id : "",//元素选择器
			ratio : 16 / 9, //要裁剪图片的宽、高比例，默认16/9
			url : "", //图片上传地址
			//图片上传额外参数
			formData : {
				needHand : false //默认不需要后台裁剪
			},
			success : null, //裁剪完成后回调
			error : null  //裁剪失败后回调
		}
		return new Crop($.extend(setting, options)).render();
	}

	function Crop(options) {
		this.options = options;
	}

	Crop.prototype = {
		render : function() {
			var self = this;
			
			//init template
			var template = 
					'<div class="cs_cropper">' + 
						'<div class="cs_cropper_picker">选择图片</div>' + 
						'<div class="cs_cropper_wrap">' + 
							'<div class="cs_cropper_preview">' + 
								'<h2 class="cs_cropper_preview_txt">预览：</h2>' + 
								'<div class="cs_cropper_preview_md"></div>' + 
							'</div>' + 
							'<div class="cs_cropper_view">' + 
								'<img src="" alt="请选择图片" />' + 
							'</div>' + 
						'</div>' +
					'</div>';
			var selector = self.options.id,
				$ele = $(self.options.id);
			$ele.append(template);
			
			//init preview
			var $preview = $(selector + " .cs_cropper_preview_md");
			$preview.outerHeight($preview.outerWidth() / self.options.ratio);
			
			var Uploader = (function(){

				// 如果使用原始大小，超大的图片可能会出现 Croper UI 卡顿，所以这里建议先缩小后再crop.
				var FRAME_WIDTH = 1600;

				var _ = WebUploader,
					Uploader = _.Uploader,
					uploadContainer = $(self.options.id),
					uploader,
					file;

				/* 判断浏览器是否支持WebUploader */
				if ( !Uploader.support() ) {
			        alert( 'Web Uploader 不支持您的浏览器！');
			        throw new Error( 'WebUploader does not support the browser you are using.' );
			    }	
				
				//提交文件时裁剪
			    Uploader.register({
			    	'before-send-file': 'cropImage'
			    },{
			    	cropImage : function(file) {
			    		var data = file._cropData,
			                image, deferred;
	
			            file = this.request( 'get-file', file );
			            deferred = _.Deferred();
	
			            image = new _.Lib.Image();
	
			            deferred.always(function() {
			                image.destroy();
			                image = null;
			            });
			            image.once( 'error', deferred.reject );
			            image.once( 'load', function() {
			                image.crop( data.x, data.y, data.width, data.height, 1 );
			            });
	
			            image.once( 'complete', function() {
			                var blob, size;
	
			                // 移动端 UC / qq 浏览器的无图模式下
			                // ctx.getImageData 处理大图的时候会报 Exception
			                // INDEX_SIZE_ERR: DOM Exception 1
			                try {
			                	throw "error";
			                    blob = image.getAsBlob();
			                    size = file.size;
			                    file.source = blob;
			                    file.size = blob.size;
								
			                    file.trigger( 'resize', blob.size, size );
			                    deferred.resolve();
			                } catch ( e ) {
			                    console.log( e );
			                    // 出错了直接继续，让其上传原始图片，并添加裁剪参数
			                    data.needHand = true;
			                    self.Uploader.setFormData(data);
			                    deferred.resolve();
			                }
			            });
	
			            file._info && image.info( file._info );
			            file._meta && image.meta( file._meta );
			            image.loadFromBlob( file.source );
			            return deferred.promise();
			    	}
			    })
				
				return {
					init : function(selectCb) {
						uploader = new Uploader({
							pick: {
			                    id: '.cs_cropper_picker',
			                    multiple: false
			                },
			                thumb: {  // 设置用什么方式去生成缩略图。
			                    quality: 70, 
			                    allowMagnify: false, // 不允许放大
			                    crop: false// 是否采用裁剪模式。如果采用这样可以避免空白内容。
			                },
			                chunked: false, // 禁掉分块传输，默认是开起的。
			                compress: false, // 禁掉上传前压缩功能，因为会手动裁剪。
			                server: self.options.url,
			                swf: '../webuploader/Uploader.swf',
			                formData : self.options.formData,
			                // 只允许选择图片文件。
			                accept: {
			                    title: 'Images',
			                    extensions: 'gif,jpg,jpeg,bmp,png',
			                    mimeTypes: 'image/*'
			                },
			                // fileNumLimit: 1,
			                onError: function() {
			                    var args = [].slice.call(arguments, 0);
			                    alert("Uploader onError:\n"+args.join('\n'));
			                }
						});
						uploader.on("beforeFileQueued", function(_file){
							//重置下队列，这样可以上传重复的图片
							uploader.reset();
						});
						uploader.on('fileQueued', function( _file ) {
			                file = _file;
			                uploader.makeThumb( file, function( error, src ) {
			                    if ( error ) {
			                        alert('不能预览');
			                        return;
			                    }
			                    
			                    selectCb( src );

			                }, FRAME_WIDTH, 1 );   // 注意这里的 height 值是 1，被当成了 100% 使用。
			            });
						uploader.on( 'uploadSuccess', function( file, response ) {
							if (self.options.success) {
								self.options.success(file, response);
							}
						});
						uploader.on( 'uploadError', function( file, reason ) {
							if (self.options.error) {
								self.options.error(file, reason);
							}
						});
						uploader.on( 'uploadComplete', function( file ) {
							//alert("complete");
						});
					},
					crop: function( data ) { //获取要裁剪的数据
			            var scale = data.width / Cropper.getImageSize().width;
			            data.scale = scale;

			            file._cropData = {
			                x: data.x,
			                y: data.y,
			                width: data.width,
			                height: data.height/*,
			                scale: data.scale*/
			            };
			        },
			        setFormData : function(param) { //文件上传参数
			        	var formData = uploader.option("formData");
			        	$.extend(formData, param);
			        	uploader.option( 'formData', formData);
			        	console.log(uploader.option("formData"));
			        },
			        upload: function() {
			            uploader.upload();
			        }
				}
			})()

			var Cropper = (function(){
				var container = $('.cs_cropper_view');
				var $image = container.find('img');
				var isBase64Supported, 
					callback;
 				/* 初始化Cropper */
 				$image.cropper({
			        aspectRatio: self.options.ratio,
			        autoCropArea: 0.6,
			        // zoomable: false,
			        preview: ".cs_cropper_preview_md,.cs_cropper_preview_sm",
			        done: function(data) {
			            // resize\move..都会触发
			        	/*
			        	var scale = data.width / data.height;
			        	var maxHeight = 160;
			        	var h = $preview.outerWidth() / scale;
			        	if (h >= maxHeight) {
			        		$preview.outerWidth(maxHeight * scale);
			        		$preview.outerHeight(maxHeight);
			        	} else {
			        		$preview.outerWidth(160);
			        		$preview.outerHeight($preview.outerWidth() / scale);
			        	}
			        	*/
			        }
			    });

 				function srcWrap(src, cb) {
 					 // we need to check this at the first time.
			        if (typeof isBase64Supported === 'undefined') {
			            (function() {
			                var support = true;
			                var data = new Image();
			                data.onload = data.onerror = function() {
			                    if( this.width != 1 || this.height != 1 ) {
			                        support = false;
			                    }
			                }
			                data.src = src;
			                isBase64Supported = support;
			            })();
			        }
		         	if ( isBase64Supported ) {
				            cb( src );
				        } else {
				            // otherwise we need server support.
				            // convert base64 to a file.
				            $.ajax('', {
				                method: 'POST',
				                data: src,
				                dataType:'json'
				            }).done(function( response ) {
				                if (response.result) {
				                    cb( response.result );
				                } else {
				                    alert("预览出错");
				                }
				            });
				        }
 				}

				return {
					setSource : function(src) {
						// 处理 base64 不支持的情况。
			            // 一般出现在 ie6-ie8
			            srcWrap( src, function( src ) {
			            	//reset the cropping zone
			            	$image.cropper("reset", true);
			            	//replace the current img
			                $image.cropper("replace", src);
			            });

			            return this;
					},
					getImageSize: function() {
			            var img = $image.cropper("getImageData");
			            return {
			                width: img.naturalWidth,
			                height: img.naturalHeight
			            }
			        },
			        getCropData: function() { //获取裁剪数据
			        	return $image.cropper("getData");
			        }
				}
			})()

			self.Uploader = Uploader;
			self.Cropper = Cropper;

			Uploader.init(function( src ) {
			    Cropper.setSource( src );
			});

			return self;
		},
		setFormData : function(param) { //给开发人员提供添加文件上传参数的接口
			if (typeof param == "object") {
				this.Uploader.setFormData(param);
			}
		},
		submit : function() {
			if (!this.options.url) {
				alert("url is undefined");
				return ;
			} 
			this.Uploader.crop(this.Cropper.getCropData());
			this.Uploader.upload();
		}
	}

	return {
		init : init
	}
})	