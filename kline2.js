(function(){
	"use strict";
 	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

 	var defaultConfig = { 
		scaleShowGridLines : true,							//图表中是否显示网格 
		scaleGridLineColor : "rgba(180, 180, 180, 0.3)",	//网格的颜色 
		scaleGridLineWidth : 1,								//网格的线宽 
		scaleShowHorizontalLines: true,						// X 轴线是否显示 
		scaleShowVerticalLines: true,						// Y 轴线是否显示 
		bezierCurve : false,								//是否为曲线 
		bezierCurveTension : 0.4,							//曲线的值 
		pointDot : true,									//是否显示线上的每个点 
		pointDotRadius : 3,									//圆点的半径 
		pointDotStrokeWidth : 1,							//笔画的宽度 
		pointHitDetectionRadius : 3,						//鼠标检测点的半径 
		datasetStroke : false,								//是否显示数据的笔画 
		datasetStrokeWidth :1,								//线的笔画宽度
		datasetFill : true,									//填充颜色 
		animation:false, 
		//图标标题模板
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	}; 
	var round = function( x ){ return x.toFixed(2); }

	

	/**
	 * 画板
	 */
	Chart.kScale = Chart.Element.extend({ 
		display: true, 
		initialize : function(){
			this.fit();
		},
		fit:function(){ 

			this.startPoint = (this.display) ? this.fontSize : 0;

			if( this.showXLabels ){
				this.endPoint = (this.display) ? this.height - (this.fontSize * 1.5) - 5 : this.height; // -5 to pad labels 
			}else{
				this.endPoint = this.height-1;
			}
			this.startPoint += this.padding;
			this.endPoint -= this.padding;
			
			if( this.paddingTop>0 ){
				this.startPoint		+=	this.paddingTop;
			}
 			this.calculateYRange();  
			this.buildYLabels(); 
			this.calculateXLabelRotation();

			this.columnHalf	= this.calculateDrawWidthScale();	//计算K线柱的宽度
			this.reCalculatePadding();
			//alert( this.xScalePaddingRight );
		}, 
		drawingArea: function(){
			return this.startPoint - this.endPoint;
		},
		calculateY : function(value){
			var scalingFactor = this.drawingArea() / (this.min - this.max); 
			return this.endPoint - (scalingFactor * (value - this.min));
		},
		calculateX : function(index){
			var innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight),
				valueWidth = innerWidth/(this.valuesCount),
				valueOffset = ( valueWidth * index ) + this.xScalePaddingLeft;  
 			return Math.round(valueOffset);
		},
		buildYLabels : function(){
			this.yLabels = []; 
			var stepDecimalPlaces = 2;// helpers.getDecimalPlaces(this.stepValue); 
			for (var i=0; i<=this.steps; i++){
				this.yLabels.push(helpers.template(this.templateString,{value:(this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)}));
			}
			this.yLabelWidth = (this.display && this.showLabels) ?  helpers.longestText(this.ctx,this.font,this.yLabels) : 0;

			//alert( this.yLabelWidth );

 		},
		calculateXLabelRotation:function(){
			this.ctx.font = this.font;

			//var firstWidth = this.ctx.measureText(this.xLabels[0]).width,
			//	lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width,
			//	firstRotated,
			//	lastRotated;

			
			//this.xScalePaddingRight = lastWidth/2 + 3;
			//this.xScalePaddingLeft = (firstWidth/2 > this.yLabelWidth + 10) ? firstWidth/2 : this.yLabelWidth + 10;

			this.xScalePaddingRight		= 3;//lastWidth/2 + 3;
			this.xScalePaddingLeft		= 3;//lastWidth/2 + 3;
			

			this.xScalePaddingRight		= this.paddingRight;
	
			//alert( this.xScalePaddingLeft );
			//alert( this.yLabelWidth );
			this.xLabelRotation = 0;

 		},
		reCalculatePadding:function(){ 
			if( this.columnHalf ){
				//alert( this.columnHalf ); 
				this.xScalePaddingRight		+= this.columnHalf;//lastWidth/2 + 3;
				this.xScalePaddingLeft		+= this.columnHalf;//lastWidth/2 + 3;
				//alert( this.paddingRight );
			}
		},
		calculateDrawWidthScale: function(){
			var sper = (this.width - this.xScalePaddingLeft - this.xScalePaddingRight)/this.valuesCount;
			if( sper>=11 ){
				return sper/3; //[sper/3,1];
			}else if( sper>=9 ){
				return (sper-1)/2; //[(sper-1)/2,1];
			}else if( sper>=7 ){
				return 3;//[3,1];
			}else if( sper>=5 ){
				return 2;//[1,2];
			}else if( sper>= 3){
				return 1;//[1,2];
			}
			return 0;
		},
		draw : function(){
			var ctx = this.ctx,
				yLabelGap = ( this.endPoint - this.startPoint) / this.steps,		//Y轴标签的数量
				xStart = Math.round(this.xScalePaddingLeft);
				 
				//alert( xStart );
				ctx.strokeStyle = "rgba(100,100,100,0.2)";
				//ctx.fillStyle = "#666";
				ctx.font = this.font;

				var linePos,isRotated,drawVerticalLine;

				if( this.showXLabels ){ 
					var stepNumber = 6; 
					//先画X轴  底部X线上的标签  画坚线
					var n = this.xLabels.length-1;
					var steps = Math.round( (n-2)/( stepNumber-1 ) );
					for( var index=n; index>=0; index-- ){


	 
						var xPos = this.calculateX(index) +  helpers.aliasPixel(this.lineWidth),
						// Check to see if line/bar here and decide where to place the line
						linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) +  helpers.aliasPixel(this.lineWidth),
						isRotated = (this.xLabelRotation > 0),
						drawVerticalLine = this.showVerticalLines;  
						//ctx.moveTo(linePos,this.endPoint);
						//ctx.lineTo(linePos,this.startPoint - 3);
						
						
						if( index == 0 ){ 
							ctx.textAlign		=  "left"; 
							ctx.textBaseline	=  "top"; 
						}else{
							ctx.textAlign		=  "center"; 
							ctx.textBaseline	=  "top";  
						}
				
						if( index == 0 || index == n || index%(steps+1) == 0 ){
							drawVerticalLine = true;
						}

						//X轴底部短线
						ctx.beginPath();
						ctx.moveTo(linePos,this.endPoint+1);
						if( drawVerticalLine ){
							ctx.lineTo(linePos,this.endPoint + 6);
						}else{
							ctx.lineTo(linePos,this.endPoint + 3);
						}
						
						ctx.stroke();
						ctx.closePath(); 
						ctx.save();

						if( drawVerticalLine ){

							//把当前画布的原点移到(x,y),后面的操作都以(x,y)作为参照点， 
							ctx.translate(xPos,(isRotated) ? this.endPoint + this.fontSize/2 : this.endPoint + 8);
							ctx.fillText( this.xLabels[index], 0, this.fontSize/2);
							ctx.restore();
							
						} 
					} 
				}
 

				this.showHorizontalLines  = true;
				 
				//画Y轴信息
				helpers.each(this.yLabels,function(labelString,index){ 
					//Y轴 画标签的位置
					var yLabelCenter = this.endPoint - (yLabelGap * index), 
						linePositionY = Math.round(yLabelCenter),
						drawHorizontalLine = this.showHorizontalLines;
					 
					ctx.textAlign		= "left"; 
					ctx.textBaseline	= "middle";


					//画Y轴上的文字
					if (this.showLabels){ 
						if( index > 0 ){ 
							if( index == 0 ){ 
								ctx.textBaseline	= "bottom";
							}else{
								ctx.textBaseline	= "middle";
							}  
							ctx.fillText( labelString, this.width-this.xScalePaddingRight+10+this.columnHalf, linePositionY); 
						}else if( this.showXLabels ){
							ctx.fillText( labelString, this.width-this.xScalePaddingRight+10+this.columnHalf, linePositionY); 
						}
					}

					// This is X axis, so draw it
					if (index === 0 && !drawHorizontalLine){
						drawHorizontalLine = true;
					}

					if (drawHorizontalLine){
						ctx.beginPath();
					}

					if (index > 0){
						// This is a grid line in the centre, so drop that
						ctx.lineWidth = this.gridLineWidth;
						ctx.strokeStyle = this.gridLineColor; 
					} else {
						// This is the first line on the scale
						ctx.lineWidth = this.lineWidth;
						ctx.strokeStyle = this.lineColor; 
					}
					
					linePositionY += helpers.aliasPixel( ctx.lineWidth );
 
 
					if( index == 0 ){
						ctx.setLineDash([0]);
					}else{
						ctx.setLineDash([1,2]);
					}

					//画水平线
					if( drawHorizontalLine ){ 
						//alert( xStart + ":" + this.width );
						ctx.moveTo( xStart-this.columnHalf, linePositionY );
						ctx.lineTo(this.width-this.xScalePaddingRight+3+this.columnHalf, linePositionY); 
						ctx.stroke();
						ctx.closePath(); 
					}
					
					ctx.lineWidth		= this.lineWidth;
					ctx.strokeStyle		= this.lineColor;

					ctx.beginPath();
					ctx.moveTo(		xStart - 5,		linePositionY	);
					ctx.lineTo(		xStart,			linePositionY	); 
					ctx.stroke();
					ctx.closePath(); 
				},this);

				ctx.setLineDash([0]); 

		}
	});

 
	

	/**
	 * 插件K线图
	 */
	Chart.Type.extend({
		name: "KLine2",
		defaults : defaultConfig,
		initialize:  function( data ){ 
			var ctx = this.chart.ctx;
			this.options.boxNode.style.position = 'relative';
			this.options.chartNode.style.cssText = 'position:absolute;left:0px;top:0px;';  

			//创建鼠标事件处理面板
			var mouseCVS = document.createElement("canvas");
	 
			mouseCVS.width = this.chart.width;
			mouseCVS.height = this.chart.height;
			mouseCVS.style.cssText = 'position:absolute;left:0px;top:0px;'; 

			this.options.boxNode.appendChild(mouseCVS);
			this.mouseCtx = mouseCVS.getContext("2d");   

			//创建新的点类 
			this.PointClass = Chart.Point.extend({
				strokeWidth : this.options.pointDotStrokeWidth,                 //笔画宽度
				radius : this.options.pointDotRadius,                           //半径
				display: this.options.pointDot,                                 //显示
				hitDetectionRadius : this.options.pointHitDetectionRadius,      //检测点的半径 
				ctx : this.mouseCtx,//this.chart.ctx,
				inRange : function(mouseX){ 
					//用平方修正负数为正值，
					//return (Math.pow(mouseX-this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius,2));  
					return ( Math.pow(mouseX-this.x, 2) < Math.pow(  this.hitDetectionRadius,2 ) );
				}
			});


			if (this.options.showTooltips){ 

				var timelineObject = this;
				//显示提示框事件绑定
				helpers.bindEvents({chart:this.mouseCtx}, ["mousemove","mouseout"], function(evt){ 
					//如果鼠标
					var activePoints = (evt.type !== 'mouseout') ? timelineObject.getPointsAtEvent(evt) : []; 

					var pos =  helpers.getRelativePosition( evt );
					timelineObject.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					}); 
					helpers.each(activePoints, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					}); 
					timelineObject.showTooltip(activePoints, pos, evt.type);
				});
			}
			
		
			this.modules = []; 
			this.xLabelLength = data.xLabels.length;
			helpers.each(data.modules,function( items ){  

				var itemObject = {
					height:items.height,
					type:items.type,
					steps:items.steps, 
					datasets:[]
				};

				helpers.each( items.datasets, function( dataset ){
				
					//新建数据对象
					var datasetObject = {
						label :				dataset.label || null,
						type :				dataset.type,
						mainData :			dataset.mainData,
						avgVolume5:			dataset.avgVolume5,
						preClose:			dataset.preClose,
						fillColor :			dataset.fillColor,
						strokeColor :		dataset.strokeColor,
						pointColor :		dataset.pointColor,
						pointStrokeColor :	dataset.pointStrokeColor,
						volPoints:[],
						points : []
					}; 
					//添加到当前对象数据集中
					itemObject.datasets.push( datasetObject );

					
					var tips = false;
					if( dataset.type == 'k' ){
						tips = true;
					}
					//对数据对象添加每个点
					helpers.each(dataset.data,function(dataPoint,index){
						//Add a new point for each piece of data, passing any required data to draw.

						
						datasetObject.points.push(new this.PointClass({
							value :				dataPoint, 
							index :				index,
							label :				data.xLabels[index],			//公用的数据label
							tips  :				tips,
							datasetLabel:		dataset.label,
							strokeColor :		dataset.pointStrokeColor,
							fillColor :			dataset.pointColor,
							highlightFill :		dataset.pointHighlightFill || dataset.pointColor,
							highlightStroke :	dataset.pointHighlightStroke || dataset.pointStrokeColor
						}));
					},this);
				
 
				},this);


				var padding = this.calculatePadding( items.orderId, data );
				items.topPos		=	padding.topPos;
				items.buttomPos		=	padding.buttomPos; 
				items.paddingRight	=	55;
				 
				if( items.type == 'mix' ){
					items.xLabels = data.xLabels; 
					items.showXLabels = true;
				}else{
					items.showXLabels = false;
				}
			 
				itemObject.scale		= this.buildScale( items );  
				this.modules.push( itemObject ); 

			},this); 
			this.render();


		},
		eachPoints : function(callback){
			helpers.each(this.modules,function( items ){ 
				helpers.each(items.datasets,function(dataset){
					helpers.each(dataset.points,callback,this);
				},this);
			},this);
		},
		getPointsAtEvent : function(e){
			var pointsArray = [], 
				eventPosition = helpers.getRelativePosition(e);
			helpers.each(this.modules,function( items ){ 
				helpers.each(items.datasets,function(dataset){
					helpers.each(dataset.points,function(point,index){  
						if (  point.inRange(eventPosition.x,eventPosition.y)){
							//alert( index );
							pointsArray.push({point:point, index:index, scale:items.scale}); 
							return pointsArray; 
						}
					});
				},this);
			},this); 

			
			return pointsArray;
		},
		calculatePadding:function( order, data ){ 
			var topHeight=0, totalHeight=0, autoHeight=0, height=0;
			var object = {top:0, extAuto:false };
			helpers.each( data.modules, function( items ){  
				totalHeight += items.height; 
				if( items.orderId < order ){  
					if( items.height == 0 ){
						object.extAuto = true;
					} 
					object.top += items.height;
				} 

				if( items.orderId == order ){  
					height = items.height;
				}
			}, this);

			autoHeight =  this.chart.height - totalHeight;
			if( object.extAuto ){ object.top += autoHeight; }
			if( height == 0    ){ height = autoHeight; }


 
			return { topPos:object.top, height:height, buttomPos: (object.top+height) };
		},
		buildScale:function(  data ){ 
			
			var minV = 0, maxV = 0;
	 
			helpers.each(data.datasets,function(dataset){ 
				if( ( typeof dataset.data[0] ) == 'number' ){
					if( minV > 0 ){
						minV = Math.min( helpers.min( dataset.data ), minV );
						maxV = Math.max( helpers.max( dataset.data ), maxV );
					}else{
						minV = helpers.min( dataset.data );
						maxV = helpers.max( dataset.data );
					} 
				}else{
					minV = 100000;
					helpers.each( dataset.data, function( d ){
						minV = Math.min( helpers.min( d ), minV );
						maxV = Math.max( helpers.max( d ), maxV );
					}); 
				} 
			});
			 
			var rectHeight1 = 0;
			var xLabels = data.xLabels;	//['1', '2', '3', '4', '5', '6', '7', '2', '3', '4', '5', '6', '7', '2', '3', '4', '5', '6', '7'];
 
			var scaleOptions = {
				//offsetGridLines:true,
				templateString : this.options.scaleLabel,
				paddingTop: data.topPos,//rectHeight1/2,
				paddingRight: data.paddingRight,
				height : data.buttomPos, //this.chart.height-item.paddingBottom,
				width :this.chart.width,
				ctx : this.chart.ctx,
				valuesCount: this.xLabelLength-1,//xLabels.length-1,
				xLabels:xLabels,
				fontSize : 12,
				id:'scale-'+ data.orderId,
				font:helpers.fontString( 12, "normal", "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"),
				calculateYRange : function(currentHeight){
						var stepNumber; 
							stepNumber 	= 	data.steps; 

 						var updatedRanges = {
							min:minV,								//网格的数量
							max:maxV,								//网格的间距
							steps:stepNumber,						//最小值
							stepValue: ( maxV-minV )/stepNumber		//最大值
						};
						helpers.extend(this, updatedRanges);
					},
				padding:0,
				showLabels:true,
				showXLabels:data.showXLabels,
				display:true
			};
			
			//this.scale = new Chart.kScale( scaleOptions );
			return new Chart.kScale( scaleOptions );
		},
		drawColumn:function( module, ctx, index, values ){
			var x,y, self=module,half=module.scale.columnHalf;
			var scalingFactor = module.scale.drawingArea() / (module.scale.min - module.scale.max);
			var cal = function(x){ return parseInt( self.scale.endPoint - (scalingFactor * ( x - self.scale.min)) )+0.5; };
			var openV,closeV,minV,maxV;
			
			openV	= cal(	values[0]	);//开盘，收盘，最低，最高
			closeV	= cal(	values[1]	);
			minV	= cal(	values[2]	);
			maxV	= cal(	values[3]	);
	 
 
			x= parseInt( module.scale.calculateX(index) )+0.5; 
			if( closeV < openV ){	//下跌
				ctx.strokeStyle = "rgba( 255,0,0,1)";
				ctx.fillStyle = "rgba( 255, 255, 255, 1)";
				//ctx.fillRect(x-2, values[0], 4, values[1] - values[0] );
				
				ctx.beginPath();
				ctx.moveTo( x, minV );
				ctx.lineTo( x, maxV ); 
				 
				ctx.moveTo( x-half, openV );
				ctx.lineTo( x+half, openV );
				ctx.lineTo( x+half, closeV );
				ctx.lineTo( x-half, closeV );
				ctx.lineTo( x-half, openV ); 
				ctx.stroke(); 
				ctx.fill();

			}else{
				ctx.strokeStyle = "rgba( 0,128,0, 1)";
				ctx.fillStyle = "rgba( 0,128,0, 1)"; 
				//ctx.fillRect(x-2, values[0], 4, values[0] -values[1]  );

				ctx.beginPath();
				ctx.moveTo( x, minV );
				ctx.lineTo( x, maxV ); 
				 
				ctx.moveTo( x-half, openV );
				ctx.lineTo( x+half, openV );
				ctx.lineTo( x+half, closeV );
				ctx.lineTo( x-half, closeV );
				ctx.lineTo( x-half, openV ); 
				ctx.stroke(); 
				ctx.fill();
			}

		},
		draw:function( ease ){ 
 
			var ctx = this.chart.ctx;  
			var easingDecimal = ease || 1; 
			helpers.each(this.modules, function( module ){  
				module.scale.draw(); 
				helpers.each(module.datasets,function(dataset){    
					 if( dataset.type == "k" ){  
						 helpers.each(dataset.points, function(point, index){  
							 point.update({x:module.scale.calculateX(index)+0.5, y:module.scale.calculateY( point.value[0] )+0.5 });
							//if (point.hasValue()){
								this.drawColumn(module, ctx, index, point.value );
							//}   
						},this);
					 }else if( dataset.type == "line" ){ 

						ctx.lineWidth = this.options.datasetStrokeWidth;
						ctx.strokeStyle = dataset.strokeColor;
						ctx.beginPath();  
						helpers.each(dataset.points, function(point, index){  
							var x = module.scale.calculateX(index)+0.5,
								y = module.scale.calculateY( point.value )+0.5;
							point.update({x:x,y:y});
							//alert( point.x );
							if (index === 0){
								ctx.moveTo( x,  y);
							}
							else{  
								ctx.lineTo( x,  y);  
							}

							
						}, this);
						ctx.stroke();
					 } 
				},this);



			},this); 
		},

		/***
		 * 显示提示框方法
		 * 1. 先判断焦点上的元素是否发生变化
		 * 2. 判断是否有多种图形数据需要显示
		 */
		showTooltip : function(ChartElements, pos, evtType ){

			// Only redraw the chart if we've actually changed what we're hovering on.
			if (typeof this.activeElements === 'undefined') this.activeElements = [];
			
			if( evtType == 'mouseout' ){
				this.mouseCtx.clearRect(0,0,this.chart.width,this.chart.height);
			}
		 

			//判断元素是否变了
			var isChanged = (function(Elements){ 
				var changed = false; 
				//元素的长度不同
				if (Elements.length !== this.activeElements.length){
					changed = true;
					return changed;
				}
				//循环判断元素子元素
				helpers.each(Elements, function(element, index){
					//alert( element.point );
					if (element.point !== this.activeElements[index].point){
						changed = true;
					}
				}, this);
				return changed;
				 
			}).call(this, ChartElements);

			//判断是否需要重新画
			if (!isChanged  ){
				return;
			}
			else{
				this.activeElements = ChartElements;
			}


	 

			//开始处理图象重画工作 
			var ctx = this.mouseCtx;
			
			if( ChartElements.length>0){ 

				var prompt = {};

				ctx.clearRect(0,0,this.chart.width,this.chart.height);
				helpers.each(ChartElements, function(element){
					var point = element.point, scale = element.scale ; 
					var leftRange = 0,//scale.xScalePaddingLeft,
						rightRange = this.chart.width-scale.xScalePaddingRight+10,
						topRange = scale.startPoint, //parseInt( point.y ) + 0.5;
						bottomRange = scale.endPoint;
				 
					var posX = parseInt( point.x )+0.5,
						posY = parseInt( point.y ) + 0.5;

					var ctx = this.mouseCtx;
					

			
					//new Chart.Rectangle({ctx:ctx,fillColor:'red',strokeColor:'blue',strokeWidth:1,x:leftRange-20,y:posY+8,width:40,base:posY-8}).draw();
					//new Chart.Rectangle({ctx:ctx,fillColor:'red',strokeColor:'blue',strokeWidth:1,x:rightRange+20,y:posY+8,width:40,base:posY-8}).draw();



					
			
					


					if(  scale.xLabels  ){
						

						if( point.tips ){
							new Chart.Rectangle({ ctx:ctx, 
								fillColor:'#EEEEEE',
								strokeColor:'#0C08F0',
								strokeWidth:1,
								x:posX,
								y:bottomRange+18,
								width:80,
								base:bottomRange+1
								}).draw();

							new Chart.Rectangle({ctx:ctx,
								fillColor:'#EEEEEE',
								strokeColor:'#0C08F0',
								strokeWidth:1,
								x:rightRange+20,
								y:posY+8,
								width:40,
								base:posY-8
								}).draw();
				
				

							ctx.lineWidth = 0.5;
							ctx.strokeStyle = '#f00';
					
					
							ctx.beginPath(); 
							//Y轴 横
							ctx.moveTo( leftRange, posY );
							ctx.lineTo( rightRange,  posY );   
							//scale.startPoint
							//X轴 竖
							ctx.moveTo( posX, topRange );
							ctx.lineTo( posX, bottomRange );   

							ctx.textAlign = "center"; 
							ctx.fillStyle = "rgba(0,0,0,0.8)"; 
							ctx.fillText(  scale.xLabels[ point.index ], posX, bottomRange+5);		//底部时间标签 

											
							//右边的百分比
							ctx.textAlign		= "left"; 
							ctx.textBaseline	= "middle";
							ctx.fillText( point.value[1], rightRange+5, posY );  


							ctx.stroke(); 
						}
					}else{
						ctx.beginPath(); 
						//X轴 竖
						ctx.moveTo( posX, topRange );
						ctx.lineTo( posX, bottomRange );  
						  
						ctx.stroke(); 

					}
					

					
					//alert( leftRange );

					ctx.textAlign = "left";
					ctx.textBaseline = "top";
					ctx.fillStyle = "rgba(0,0,0,0.5)";
					ctx.font = scale.fontSize+"px Arial";
					
					//alert( scale.id );
					
					
					var txt = "";
				 
					if( point.value[0]   ){
						//alert(  point.value );
						txt = " 开盘: "+ round( point.value[0] ) + "  收盘: "+ round( point.value[1] )+ "  最高: "+ round( point.value[3] )+ "  最低: "+ round( point.value[2] )  ;

						//ctx.fillText( txt,leftRange, topRange-scale.fontSize/2 );   
					}else{
						//ctx.fillText(" left:"　, leftRange, topRange-scale.fontSize/2 ); 　 
						txt =  point.datasetLabel+":"+point.value;
					}

					if( prompt[scale.id] ){
						prompt[scale.id].txt  += " " + txt;
					}else{
						prompt[scale.id]  = {txt:txt, x:leftRange, y:topRange-scale.fontSize/2 };
					}

				}, this);

				helpers.each( prompt, function( value,key){ 
					//alert( key + "=" + value.txt );
					ctx.fillText( value.txt, value.x, value.y );   
				},this);
			}
		}



	});
 
	
}).call(this);