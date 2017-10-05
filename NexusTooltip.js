function NexusTooltip(element,options){
	this.node=element;
	this.$node=$(element);

	this.option(options||{}).__init();
}

NexusTooltip.prototype.config={
	direction:'bottom',
	openTrigger:'mouseenter',
	closeTrigger:'mouseleave',
	indent:5
};
NexusTooltip.prototype.__configValidators={
	direction:function(val){
		var allowed=['top','right','bottom','left'];

		return val===undefined?allowed:allowed.indexOf(val)>-1;
	}
};

NexusTooltip.prototype.__init=function(){
	if(!!this.node.__NexusTooltip)
		return this;

	var self=this;
	this.node.__NexusTooltip=this;
	this.$node
		.on(this.config.openTrigger,function(){
			self.show();
		})
		.on(this.config.closeTrigger,function(){
			self.hide();
		});

	return this;
};

/**
 * @param name string|Object require
 * @param value
 * @returns mixed|null|NexusTooltip
 */
NexusTooltip.prototype.option=function(name,value){
	if(typeof name=='string' && value===undefined){
		return (name in this.config)?this.config[name]:null;
	}else if(typeof name!='object'){
		var o={};
		o[name]=value;
		name=o;
	}

	if(typeof name!='object')
		return this;

	for(var i in this.config){
		if(!this.config.hasOwnProperty(i) || !(i in name) && this.$node.attr('data-'+i)===undefined)
			continue;

		var type=typeof this.config[i];
		value=!!name[i]?name[i]:this.$node.attr('data-'+i);

		if(type=='boolean')
			value=value=='true'?true:(value=='false'?false:!!value);
		else if(type=='object')
			try{
				value=JSON.parse(value);
			} catch(e){
				continue;
			}
		else if(type=='function')
			value=new Function(value);
		else if(type!='string')
			value=+value.replace(/\D+?/g,'');

		if(i in this.__configValidators && !this.__configValidators[i](value))
			continue;

		this.config[i]=value;
	}

	return this;
};

NexusTooltip.prototype.trigger=function(){
	return this[this.get().is(':visible')?'hide':'show']();
};
NexusTooltip.prototype.show=function(){
	this.get().show();

	return this;
};
NexusTooltip.prototype.hide=function(){
	this.get().hide();

	return this;
};

/**
 * @returns jQuery
 */
NexusTooltip.prototype.get=function(){
	if(!!this.__tooltip)
		return this.__tooltip;

	var id='NexusTooltip_'+(new Date()).getTime()+Math.random().toString().replace('.',''),
		html=this.$node.attr('data-tooltip'),
		cont=$(html);

	$('<div></div>')
		.attr({
			'id':id,
			'class':'NexusTooltip '+this.config.direction
		})
		.css(this.$node.offset())
		.append('<div class="arrow"></div>')
		.append('<div class="content">'+(cont.size()?cont.html():html)+'</div>')
		.appendTo($('body'));

	this.__tooltip=$('#'+id).hide();
	this.__tooltip.get(0).__NexusTooltip=this;

	this.correctPosition();

	return this.__tooltip;
};

NexusTooltip.prototype.changeDirection=function(direction){
	if(this.__configValidators.direction(direction))
		this.get()
			.removeClass(this.__configValidators.direction().join(' '))
			.addClass(direction)
			.get(0).__NexusTooltip.correctPosition();

	return this;
};

NexusTooltip.prototype.correctPosition=function(){
	var $tooltip=this.get(),
		offset=this.$node.offset();

	switch(this.config.direction){
		case 'top':
			$tooltip.css({
				top:offset.top-$tooltip.outerHeight(true)-this.config.indent,
				left:offset.left-$tooltip.outerWidth(true)/2+this.$node.width()/2
			});
			break;
		case 'right':
			$tooltip.css({
				top:offset.top+this.$node.height()/2-$tooltip.outerHeight(true)/2,
				left:offset.left+this.$node.width()+this.config.indent
			});
			break;
		case 'bottom':
			$tooltip.css({
				top:offset.top+this.$node.height()+this.config.indent,
				left:offset.left-$tooltip.outerWidth(true)/2+this.$node.width()/2
			});
			break;
		case 'left':
			$tooltip.css({
				top:offset.top+this.$node.height()/2-$tooltip.outerHeight(true)/2,
				left:offset.left-$tooltip.outerWidth(true)-this.config.indent
			});
			break;
		default:break;
	}

	return this;
};