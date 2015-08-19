
(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
 
		scaleShowGridLines : true,					//ͼ�����Ƿ���ʾ���� 
		scaleGridLineColor : "rgba(0,0,0,.05)",		//�������ɫ 
		scaleGridLineWidth : 1,						//������߿� 
		scaleShowHorizontalLines: true,				// X �����Ƿ���ʾ 
		scaleShowVerticalLines: true,				// Y �����Ƿ���ʾ 
		bezierCurve : false,							//�Ƿ�Ϊ���� 
		bezierCurveTension : 0.4,					//���ߵ�ֵ 
		pointDot : false,							//�Ƿ���ʾ���ϵ�ÿ���� 
		pointDotRadius : 3,							//Բ��İ뾶 
		pointDotStrokeWidth : 0.5,					//�ʻ��Ŀ�� 
		pointHitDetectionRadius : 20,				//������İ뾶 
		datasetStroke : false,						//�Ƿ���ʾ���ݵıʻ� 
		datasetStrokeWidth : 0.5,					//�ߵıʻ����
		datasetFill : false,							//�����ɫ

		//ͼ�����ģ��
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};

	
	var ScaleClass = Chart.Scale.extend({
		draw : function(){
			var ctx = this.ctx,
				yLabelGap = (this.endPoint - this.startPoint) / this.steps,		//Y���ǩ������
				xStart = Math.round(this.xScalePaddingLeft);

			//alert( this.display );
			if (this.display){
				ctx.fillStyle = this.textColor;
				ctx.font = this.font;

				//��Y����Ϣ
				helpers.each(this.yLabels,function(labelString,index){


					//Y�� ����ǩ��λ��
					var yLabelCenter = this.endPoint - (yLabelGap * index),
					
						//
						linePositionY = Math.round(yLabelCenter),
						drawHorizontalLine = this.showHorizontalLines;
					
					//alert( yLabelCenter );


					ctx.textAlign		= "right";
					ctx.textBaseline	= "middle";
					
					//��Y���ϵ�����
					if (this.showLabels){
						ctx.fillText( labelString, xStart - 10, yLabelCenter);
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

					//��ˮƽ��
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

				/**
				//��X��
				helpers.each(this.xLabels,function(label,index){


					var xPos = this.calculateX(index) +  helpers.aliasPixel(this.lineWidth),
						// Check to see if line/bar here and decide where to place the line
						linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) +  helpers.aliasPixel(this.lineWidth),
						isRotated = (this.xLabelRotation > 0),
						drawVerticalLine = this.showVerticalLines;

					// This is Y axis, so draw it
					if (index === 0 && !drawVerticalLine){
						drawVerticalLine = true;
					}

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

					if (drawVerticalLine){
						ctx.moveTo(linePos,this.endPoint);
						ctx.lineTo(linePos,this.startPoint - 3);
						ctx.stroke();
						ctx.closePath();
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
					
					//�ѵ�ǰ������ԭ���Ƶ�(x,y),����Ĳ�������(x,y)��Ϊ���յ㣬 
					ctx.translate(xPos,(isRotated) ? this.endPoint + 12 : this.endPoint + 8);

					//rotate������ת��ǰ�Ļ�ͼ��
					ctx.rotate(  helpers.radians( this.xLabelRotation )*-1 );
					

					//��X������
					ctx.font = this.font;
					ctx.textAlign = (isRotated) ? "right" : "center";
					ctx.textBaseline = (isRotated) ? "middle" : "top";
					ctx.fillText(label, 0, 0);
					ctx.restore();
				},this);

				**/

			}
		}

	});


	Chart.Type.extend({
		name: "TimeChart",
		defaults : defaultConfig,
		initialize:  function(data){

			//�����µĵ��� 
			this.PointClass = Chart.Point.extend({
				strokeWidth : this.options.pointDotStrokeWidth,                 //�ʻ����
				radius : this.options.pointDotRadius,                           //�뾶
				display: this.options.pointDot,                                 //��ʾ
				hitDetectionRadius : this.options.pointHitDetectionRadius,      //����İ뾶
				ctx : this.chart.ctx,
				inRange : function(mouseX){ 
					//��ƽ����������Ϊ��ֵ��
					return (Math.pow(mouseX-this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius,2));
				}
			});
			
			
			this.datasets = [];


			//�����ʾ���¼� 
			//Set up tooltip events on the chart
			if (this.options.showTooltips){ 
				//��ʾ��ʾ���¼���
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){ 
					//������
					var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : []; 
					this.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					}); 
					helpers.each(activePoints, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					});
					this.showTooltip(activePoints);
				});
			}
			
			var b = false;

			//ѭ�����������ݼ�
			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset){


				//�½����ݶ���
				var datasetObject = {
					label :				dataset.label || null,
					fillColor :			dataset.fillColor,
					strokeColor :		dataset.strokeColor,
					pointColor :		dataset.pointColor,
					pointStrokeColor :	dataset.pointStrokeColor,
					points : []
				};


				//��ӵ���ǰ�������ݼ���
				this.datasets.push(datasetObject);
				
				//�����ݶ������ÿ����
				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.points.push(new this.PointClass({
						value :				dataPoint,
						label :				data.labels[index],			//���õ�����label
						datasetLabel:		dataset.label,
						strokeColor :		dataset.pointStrokeColor,
						fillColor :			dataset.pointColor,
						highlightFill :		dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke :	dataset.pointHighlightStroke || dataset.pointStrokeColor
					}));
				},this);
				
				//if( b == false ){
				//	b = true;
					//������
					this.buildScale(data.labels);
				//}


				//���㼰��
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
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,function(point){
					if (point.inRange(eventPosition.x,eventPosition.y)) pointsArray.push(point);
				});
			},this);
			return pointsArray;
		},
		buildScale : function(labels){
			

		 
			//
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachPoints(function(point){
					values.push(point.value);
				}); 
				return values;
			};
			
			var scaleOptions = {
				templateString :	this.options.scaleLabel,		//��ǩ
				height :			this.chart.height,
				width : this.chart.width,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				//��ǩ����
				valuesCount : 240,//labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange : function(currentHeight){

					//alert( "ok" );

					//steps :		numberOfSteps,							//���������
					//stepValue :	stepValue,								//����ļ��
					//min :			graphMin,								//��Сֵ
					//max :			graphMin + (numberOfSteps * stepValue)	//���ֵ
					

					/**
					var updatedRanges = helpers.calculateScaleRange(
						dataTotal(),	
						currentHeight,
						this.fontSize,
						this.beginAtZero,
						this.integersOnly
					); 
					**/

					var valuesArray = dataTotal();
					var min = helpers.min( valuesArray );
					var max = helpers.max( valuesArray );
					

					//alert( valuesArray.length );
					var updatedRanges = {
						min:min,
						max:max,
						steps:7,
						stepValue:( (max-min)/7 ).toFixed(2)
					};
					helpers.extend(this, updatedRanges);


				},
				xLabels : labels,
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
				
				//alert( pointsWithValues.length );
				//Transition each point first so that the line and point drawing isn't out of sync
				//We can use this extra loop to calculate the control points of this dataset also in this loop

				helpers.each(dataset.points, function(point, index){
					if (point.hasValue()){
						point.transition({
							y : this.scale.calculateY(point.value),
							x : this.scale.calculateX(index)
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
				helpers.each(pointsWithValues,function(point){
					point.draw();
				});
			},this);
		}
	});


}).call(this);