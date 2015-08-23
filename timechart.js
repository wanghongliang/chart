
(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;



	var ScaleClass = Chart.Scale.extend({
		initialize : function(){
			this.fit();
		},
		//处理Y轴上的文本
		buildYLabels : function(){ 
			//Y轴标签
			this.yLabels = []; 
			//小数的位数
			var stepDecimalPlaces = 2; //helpers.getDecimalPlaces( this.stepValue ); 
			for (var i=0; i<=this.steps; i++){ 
				//
				this.yLabels.push( helpers.template(this.templateString,{value:(this.min + (i * this.stepValue)).toFixed( stepDecimalPlaces ) }));
			} 
			//Y轴上宽度
			this.yLabelWidth = (this.display && this.showLabels) ? helpers.longestText(this.ctx,this.font,this.yLabels) : 0;
		}, 
		//根据数据索引获取分钟字符串
		getMinute: function( index ){ 
			if( index>120 ) index+=90;
			var d = new Date( this.startTime+index*60*1000 ); 
			var m = d.getMinutes()>0?d.getMinutes():"00";
			return d.getHours()+ ":" + m;
		}, 
		calculateY : function(value){
			var scalingFactor = this.drawingArea() / (this.min - this.max); 
			return this.endPoint - (scalingFactor * (value - this.min));
		},
		calculateYByScale : function(value){ 
			var s1 = this.max/this.centerValue*100-100; 
			var scalingFactor = this.drawingArea() / ( s1 * -2 );  
			return this.endPoint - (scalingFactor *  (s1+value) );
		},
		draw : function(){
			var ctx = this.ctx,
				yLabelGap = (this.endPoint - this.startPoint) / this.steps,		//Y轴标签的数量
				xStart = Math.round(this.xScalePaddingLeft);

			//alert( this.display );
			if (this.display){
				ctx.fillStyle = this.textColor;
				ctx.font = this.font;
				
				
				this.showVerticalLines = false; 


				//先画Y轴
				for( var index=0; index<=this.valuesCount; index++ ){
						var xPos = this.calculateX(index) +  helpers.aliasPixel(this.lineWidth),
						// Check to see if line/bar here and decide where to place the line
						linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) +  helpers.aliasPixel(this.lineWidth),
						isRotated = (this.xLabelRotation > 0),
						drawVerticalLine = this.showVerticalLines; 
					//alert( xPos );
					// This is Y axis, so draw it
					if (index === 0 && !drawVerticalLine){
						drawVerticalLine = true;
					}else{
						if( index%30==0 ){
							drawVerticalLine = true;
						}
					}

					if( index%30==0 ){ 

					if (drawVerticalLine){
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

					if( index%60 == 0 ){
						//ctx.strokeStyle = "rgba(200,200,220,1)";

						if( index%120 == 0 ){
							//alert( ctx.lineWidth );
							//ctx.strokeStyle = "rgba(200,200,220,1)";
							//ctx.lineWidth = 2 ; 
						}
					}else{
						ctx.setLineDash([1,2]);
					}

					if (drawVerticalLine){
						
						ctx.moveTo(linePos,this.endPoint);
						ctx.lineTo(linePos,this.startPoint - 3);
	
						ctx.stroke();
						ctx.closePath();
						
					}


					if( index > 0 ){
						ctx.setLineDash([0]);
					}
				
					ctx.lineWidth = this.lineWidth;
					ctx.strokeStyle = this.lineColor;
					

					//alert( "linePos:"+linePos + "endPoint:" + ( this.endPoint +5  ) );

					// Small lines at the bottom of the base grid line
					ctx.beginPath();
					ctx.moveTo(linePos,this.endPoint);
					ctx.lineTo(linePos,this.endPoint + 5);
					ctx.stroke();
					ctx.closePath(); 
					ctx.save();
					
					//把当前画布的原点移到(x,y),后面的操作都以(x,y)作为参照点， 
					ctx.translate(xPos,(isRotated) ? this.endPoint + 12 : this.endPoint + 8);

					//rotate方法旋转当前的绘图。
					//ctx.rotate(  helpers.radians( this.xLabelRotation )*-1 );
					

					//画X轴文字
					ctx.font = this.font;
					//ctx.textAlign = (isRotated) ? "right" : "center";
					//ctx.textBaseline = (isRotated) ? "middle" : "top";
					//if( this.valuesCount == index ){
					//	ctx.textAlign =  "right";
					//}else{
					ctx.textAlign =  "center";
					//}
					ctx.textBaseline = "top";

					ctx.fillText( this.getMinute(index), 0, 0);
					ctx.restore();

					}
				}



				
				//alert( this.steps );
				var centerIndex = this.steps/2;
			
				//alert( this.yLabels[centerIndex] );
				var centerValue = parseFloat(this.yLabels[centerIndex]);
					
				this.centerValue = centerValue;
					
				//画Y轴信息
				helpers.each(this.yLabels,function(labelString,index){


					//Y轴 画标签的位置
					var yLabelCenter = this.endPoint - (yLabelGap * index),
					
						//
						linePositionY = Math.round(yLabelCenter),
						drawHorizontalLine = this.showHorizontalLines;
					
					//alert( yLabelCenter );
					

					ctx.textAlign		= "right";
					ctx.textBaseline	= "middle";
					
					//画Y轴上的文字
					if (this.showLabels){
						ctx.fillText( labelString, xStart - 10, yLabelCenter);

						ctx.textAlign		= "left"; 
						ctx.fillText( (parseFloat(this.yLabels[index])/centerValue*100-100).toFixed(2) + "%", this.width + 5, yLabelCenter);
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


					if( centerIndex == index ){
						//ctx.strokeStyle = "rgba(200,200,220,1)";
						//ctx.lineWidth = 1;
						ctx.strokeStyle = "rgba( 200,200,255,1)";
					}
					//画水平线
					if(drawHorizontalLine){ 
						ctx.moveTo( xStart, linePositionY );
						ctx.lineTo(this.width, linePositionY);
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
			}
		}

	});



	var defaultConfig = {
 
		scaleShowGridLines : true,					//图表中是否显示网格 
		scaleGridLineColor : "rgba(220,220,250,0.5)",		//网格的颜色 
		scaleGridLineWidth : 1,						//网格的线宽 
		scaleShowHorizontalLines: true,				// X 轴线是否显示 
		scaleShowVerticalLines: true,				// Y 轴线是否显示 
		bezierCurve : false,							//是否为曲线 
		bezierCurveTension : 0.4,					//曲线的值 
		pointDot : true,							//是否显示线上的每个点 
		pointDotRadius : 3,							//圆点的半径 
		pointDotStrokeWidth : 1,					//笔画的宽度 
		pointHitDetectionRadius : 3,				//鼠标检测点的半径 
		datasetStroke : false,						//是否显示数据的笔画 
		datasetStrokeWidth :1,						//线的笔画宽度
		datasetFill : true,							//填充颜色
		
		animation:false,

		//图标标题模板
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};

	

	Chart.Type.extend({
		name: "TimeChart",
		defaults : defaultConfig,
		initialize:  function(data){


			var ctx = this.chart.ctx;
			this.options.boxNode.style.position = 'relative';
			this.options.chartNode.style.cssText = 'position:absolute;left:0px;top:0px;';  

			//创建鼠标事件处理面板
			var mouseCVS = document.createElement("canvas");
			//mouseCVS.id = "canvas-mouse-" + this.index;
		 
			mouseCVS.width = this.chart.width;
			mouseCVS.height = this.chart.height;
			mouseCVS.style.cssText = 'position:absolute;left:0px;top:0px;'; 


			//alert( this.width );
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
			
			
			this.datasets = [];


			//添加提示框事件 
			//Set up tooltip events on the chart
			if (this.options.showTooltips){ 

				var timelineObject = this;
				//显示提示框事件绑定
				helpers.bindEvents({chart:this.mouseCtx}, ["mousemove"], function(evt){ 
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
					timelineObject.showTooltip(activePoints, pos);
				});
			}
			


			var b = false;
			//底盘
			this.buildScale( data );


			//循环处理多个数据集
			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset){ 
				//新建数据对象
				var datasetObject = {
					label :				dataset.label || null,
					preClose:			dataset.preClose,
					fillColor :			dataset.fillColor,
					strokeColor :		dataset.strokeColor,
					pointColor :		dataset.pointColor,
					pointStrokeColor :	dataset.pointStrokeColor,
					points : []
				}; 
				//添加到当前对象数据集中
				this.datasets.push(datasetObject);
				
				//对数据对象添加每个点
				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.points.push(new this.PointClass({
						value :				dataPoint, 
						label :				index+1,			//公用的数据label
						datasetLabel:		dataset.label,
						strokeColor :		dataset.pointStrokeColor,
						fillColor :			dataset.pointColor,
						highlightFill :		dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke :	dataset.pointHighlightStroke || dataset.pointStrokeColor
					}));
				},this);
				
				//if( b == false ){
				//	b = true;
					
				//}


				//画点及线
				this.eachPoints(function(point, index){
					helpers.extend(point, {
						x: this.scale.calculateX(index),
						y: this.scale.endPoint
					});
					point.save();
				}, this);

			},this);

			

			this.render();
		},
		update : function(){
			this.scale.update();
			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor', 'strokeColor']);
			});
			this.eachPoints(function(point){
				point.save();
			});
			this.render();
		},
		eachPoints : function(callback){
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,callback,this);
			},this);
		},
		getPointsAtEvent : function(e){
			var pointsArray = [],
				eventPosition = helpers.getRelativePosition(e);

			//alert( eventPosition.x + ":" + eventPosition.y );
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,function(point){

					//if( point.x == eventPosition.x ){
						//alert( point.x );
					//	pointsArray.push(point);
					//}
					if (point.inRange(eventPosition.x,eventPosition.y)) pointsArray.push(point);

					return pointsArray;
				});
			},this);
			return pointsArray;
		},
		
		buildScale : function( data ){
			

			//alert( helpers.max );
			//
			var self = this;
			
			var mainCenterValue = 0;
			var minV = 0, maxV = 0, centerV=0, maxScaleV = 0;
			helpers.each(data.datasets,function(dataset){ 
					if( dataset.mainData ){
						mainCenterValue = dataset.preClose; 
					}
					minV = helpers.min( dataset.data );
					maxV = helpers.max( dataset.data );
					centerV = dataset.preClose;
					var m = Math.max( maxV-centerV, centerV-minV );
					maxScaleV = Math.max( ((m+centerV)/centerV*100-100), maxScaleV );  
					//alert( centerV + "-" + maxV + "-" + minV + " - " + maxScaleV );
					//alert( centerV + "-" + maxV + "-" + minV + " - " + m +":" + ((m+centerV)/centerV*100-100) + ":" + maxScaleV );
			});
			
			//maxScaleV+=0.5;
			//alert( maxScaleV );

			maxV = mainCenterValue*(100+maxScaleV)/100;
			minV = mainCenterValue*(100-maxScaleV)/100;


			//alert( maxV + ", " + minV + ", " + maxScaleV);
			
			var scaleOptions = {
				startTime:(new Date("2011/11/11 9:30:00")).getTime(), //
				templateString :	this.options.scaleLabel,		//标签
				height :			this.chart.height,
				width : this.chart.width-50,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				//标签数量
				valuesCount : 240,//labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange : function(currentHeight){ 


					var stepNumber = self.options.stepNumber;//10;
 
					//var minV = self.options.minValue; //helpers.min( valuesArray );
					//var maxV = self.options.maxValue; //helpers.max( valuesArray );
					//var centerV = self.options.centerValue; 
					//var m = helpers.max( [maxV-centerV, centerV-minV] );
					//minV = centerV - m;
					//maxV = centerV + m;


					//alert( valuesArray.length );
					var updatedRanges = {
						min:minV,								//网格的数量
						max:maxV,								//网格的间距
						steps:stepNumber,						//最小值
						stepValue: ( maxV-minV )/stepNumber		//最大值
					};
					helpers.extend(this, updatedRanges);


				},
				xLabels :[],// data.labels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
				showLabels : this.options.scaleShowLabels,
				display : this.options.showScale
			};


			
			if (this.options.scaleOverride){
				helpers.extend(scaleOptions, {
					calculateYRange: helpers.noop,
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				});
			}


			this.scale = new ScaleClass( scaleOptions ); //new Chart.Scale(scaleOptions);
		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			//alert( this.scale.valuesCount );

			helpers.each(valuesArray,function(value,datasetIndex){ 

				//Add a new point for each piece of data, passing any required data to draw.
				this.datasets[datasetIndex].points.push(new this.PointClass({
					value : value,
					label : label,
					x: this.scale.calculateX(this.scale.valuesCount+1),
					y: this.scale.endPoint,
					strokeColor : this.datasets[datasetIndex].pointStrokeColor,
					fillColor : this.datasets[datasetIndex].pointColor
				}));


			},this);

			this.scale.addXLabel(label);
			//Then re-render the chart.
			this.update();
		},
		removeData : function(){
			this.scale.removeXLabel();
			//Then re-render the chart.
			helpers.each(this.datasets,function(dataset){
				dataset.points.shift();
			},this);
			this.update();
		},
		reflow : function(){
			var newScaleProps = helpers.extend({
				height : this.chart.height,
				width : this.chart.width
			});
			this.scale.update(newScaleProps);
		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			this.clear();

			var ctx = this.chart.ctx;

			// Some helper methods for getting the next/prev points
			var hasValue = function(item){
				return item.value !== null;
			},
			nextPoint = function(point, collection, index){
				return helpers.findNextWhere(collection, hasValue, index) || point;
			},
			previousPoint = function(point, collection, index){
				return helpers.findPreviousWhere(collection, hasValue, index) || point;
			};

			this.scale.draw(easingDecimal);


			helpers.each(this.datasets,function(dataset){
				var pointsWithValues = helpers.where(dataset.points, hasValue);


				//alert( dataset.preClose );
				
				//alert( pointsWithValues.length );
				//Transition each point first so that the line and point drawing isn't out of sync
				//We can use this extra loop to calculate the control points of this dataset also in this loop

				helpers.each(dataset.points, function(point, index){
					if (point.hasValue()){
						point.transition({
							//y : this.scale.calculateY(point.value),
							y : this.scale.calculateYByScale( point.value/ dataset.preClose*100-100 ),//this.scale.calculateY(point.value),
							x : this.scale.calculateX(index)+0.5
						}, easingDecimal);
					}
				},this);


				// Control points need to be calculated in a seperate loop, because we need to know the current x/y of the point
				// This would cause issues when there is no animation, because the y of the next point would be 0, so beziers would be skewed
				if (this.options.bezierCurve){

					helpers.each(pointsWithValues, function(point, index){


						var tension = (index > 0 && index < pointsWithValues.length - 1) ? this.options.bezierCurveTension : 0;

						point.controlPoints = helpers.splineCurve(
							previousPoint( point, pointsWithValues, index ),
							point,
							nextPoint( point, pointsWithValues, index ),
							tension
						);

						// Prevent the bezier going outside of the bounds of the graph

						// Cap puter bezier handles to the upper/lower scale bounds
						if (point.controlPoints.outer.y > this.scale.endPoint){
							point.controlPoints.outer.y = this.scale.endPoint;
						}
						else if (point.controlPoints.outer.y < this.scale.startPoint){
							point.controlPoints.outer.y = this.scale.startPoint;
						}

						// Cap inner bezier handles to the upper/lower scale bounds
						if (point.controlPoints.inner.y > this.scale.endPoint){
							point.controlPoints.inner.y = this.scale.endPoint;
						}
						else if (point.controlPoints.inner.y < this.scale.startPoint){
							point.controlPoints.inner.y = this.scale.startPoint;
						}
					},this);
				}


				//Draw the line between all the points
				ctx.lineWidth = this.options.datasetStrokeWidth;
				ctx.strokeStyle = dataset.strokeColor;
				ctx.beginPath();

				var n=0;

				helpers.each(pointsWithValues, function(point, index){
					if (index === 0){
						ctx.moveTo(point.x, point.y);
					}
					else{
						if(this.options.bezierCurve){
							var previous = previousPoint(point, pointsWithValues, index);
							
							/***
							alert( 
								index + " = " + 
								Math.ceil( previous.controlPoints.outer.x )
								+ ", y" + 
								Math.ceil( previous.controlPoints.outer.y )
								+ ", x" +
								Math.ceil( point.controlPoints.inner.x )
								+ ", y" +
								Math.ceil( point.controlPoints.inner.y )
								+ ", x" +
								Math.ceil( point.x )
								+ ", y" +
								Math.ceil( point.y )
								
								);

							**/
							ctx.bezierCurveTo(
								previous.controlPoints.outer.x,
								previous.controlPoints.outer.y,
								point.controlPoints.inner.x,
								point.controlPoints.inner.y,
								point.x,
								point.y
							);
						}
						else{
							ctx.lineTo(point.x,point.y);
						}
					}

					n++;

				}, this);
				
				//alert( n );

				ctx.stroke();

				if (this.options.datasetFill && pointsWithValues.length > 0){
					//Round off the line by going to the base of the chart, back to the start, then fill.
					ctx.lineTo(pointsWithValues[pointsWithValues.length - 1].x, this.scale.endPoint);
					ctx.lineTo(pointsWithValues[0].x, this.scale.endPoint);
					ctx.fillStyle = dataset.fillColor;
					ctx.closePath();
					ctx.fill();
				}

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				//helpers.each(pointsWithValues,function(point){
					//point.draw();
				//});
			},this);
		},
		
		/***
		 * 显示提示框方法
		 * 1. 先判断焦点上的元素是否发生变化
		 * 2. 判断是否有多种图形数据需要显示
		 */
		showTooltip : function(ChartElements, pos){
			// Only redraw the chart if we've actually changed what we're hovering on.
			if (typeof this.activeElements === 'undefined') this.activeElements = [];

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
					if (element !== this.activeElements[index]){
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
			ctx.clearRect(0,0,this.chart.width,this.chart.height);
				
			if( ChartElements.length>0){ 

				var point = ChartElements[0];

				var leftRange = this.scale.xScalePaddingLeft,
					rightRange = this.chart.width-this.scale.xScalePaddingRight-48,
					topRange = this.scale.startPoint, //parseInt( point.y ) + 0.5;
					bottomRange = this.scale.endPoint;
				
				var posX = parseInt( point.x )+0.5,
					posY = parseInt( point.y ) + 0.5;
				
				var ctx = this.mouseCtx;
				ctx.clearRect(0,0,this.chart.width,this.chart.height);

				new Chart.Rectangle({ctx:ctx,fillColor:'#6CB8F0',strokeColor:'#0C08F0',strokeWidth:1,x:posX,y:bottomRange+18,width:40,base:bottomRange+1}).draw();
				new Chart.Rectangle({ctx:ctx,fillColor:'red',strokeColor:'blue',strokeWidth:1,x:leftRange-18,y:posY+8,width:36,base:posY-8}).draw();
				new Chart.Rectangle({ctx:ctx,fillColor:'red',strokeColor:'blue',strokeWidth:1,x:rightRange+18,y:posY+8,width:36,base:posY-8}).draw();
				
				

				
				ctx.lineWidth = 0.5;
				ctx.strokeStyle = '#f00';
				ctx.beginPath(); 

				ctx.moveTo( leftRange, posY );
				ctx.lineTo( rightRange,  posY );  
				//this.scale.startPoint
				//Y轴 竖
				ctx.moveTo( posX, topRange );
				ctx.lineTo( posX, bottomRange );  


				//两个轴的标签文本
				//画X轴文字 
				ctx.fillStyle = "#FFF";
				ctx.textAlign = "center";
				ctx.textBaseline =  "middle";

				//画底部
				ctx.fillText( this.scale.getMinute( parseInt( point.label )-1) , posX, bottomRange+10);		//底部时间标签


				ctx.textAlign = "right";

				//画右边
				ctx.fillText( point.value , leftRange-5, posY+1 ); 

				ctx.textAlign = "left";

				//右边的百分比
				ctx.fillText( (point.value /this.scale.centerValue*100-100).toFixed(2) + "%"  , rightRange+5, posY+1 ); 


				ctx.stroke();


				point.draw();
 
			}else{
				//ctx.beginPath(); 
				//ctx.fillStyle = "#000";
				//ctx.textAlign = "center";
				//ctx.textBaseline =  "middle";
				//ctx.fillText( this.activeElements.length + "" +pos.x +","+  pos.y   , pos.x,  pos.y ); 
				//ctx.stroke();
			}

			return this;
		}
	});


}).call(this);