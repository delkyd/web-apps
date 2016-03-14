/**
 *  InputField.js
 *
 *  Created by Alexander Yuzhin on 4/10/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

/**
 *  Using template
 *
 *  <div class="input-field">
 *    <input type="text" name="range" class="form-control"><span class="input-error"/>
 *  </div>
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Tooltip'
], function () { 'use strict';

    Common.UI.InputField = Common.UI.BaseView.extend((function() {
        return {
            options : {
                id          : null,
                cls         : '',
                style       : '',
                value       : '',
                type        : 'text',
                name        : '',
                validation  : null,
                allowBlank  : true,
                placeHolder : '',
                blankError  : null,
                spellcheck  : false,
                maskExp     : '',
                validateOnChange: false,
                validateOnBlur: true,
                disabled: false
            },

            template: _.template([
                '<div class="input-field" style="<%= style %>">',
                    '<input ',
                        'type="<%= type %>" ',
                        'name="<%= name %>" ',
                        'spellcheck="<%= spellcheck %>" ',
                        'class="form-control <%= cls %>" ',
                        'placeholder="<%= placeHolder %>" ',
                        'value="<%= value %>"',
                    '>',
                    '<span class="input-error"/>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                var me = this,
                    el = $(this.el);

                this.id             = me.options.id || Common.UI.getId();
                this.cls            = me.options.cls;
                this.style          = me.options.style;
                this.value          = me.options.value;
                this.type           = me.options.type;
                this.name           = me.options.name;
                this.validation     = me.options.validation;
                this.allowBlank     = me.options.allowBlank;
                this.placeHolder    = me.options.placeHolder;
                this.template       = me.options.template || me.template;
                this.editable       = me.options.editable || true;
                this.disabled       = me.options.disabled;
                this.spellcheck     = me.options.spellcheck;
                this.blankError     = me.options.blankError || 'This field is required';
                this.validateOnChange = me.options.validateOnChange;
                this.validateOnBlur = me.options.validateOnBlur;
                this.maxLength      = me.options.maxLength;

                me.rendered         = me.options.rendered || false;

                if (me.options.el) {
                    me.render();
                }
            },

            render : function(parentEl) {
                var me = this;

                if (!me.rendered) {
                    this.cmpEl = $(this.template({
                        id          : this.id,
                        cls         : this.cls,
                        style       : this.style,
                        value       : this.value,
                        type        : this.type,
                        name        : this.name,
                        placeHolder : this.placeHolder,
                        spellcheck  : this.spellcheck,
                        scope       : me
                    }));

                    if (parentEl) {
                        this.setElement(parentEl, false);
                        parentEl.html(this.cmpEl);
                    } else {
                        $(this.el).html(this.cmpEl);
                    }
                } else {
                    this.cmpEl = $(this.el);
                }

                if (!me.rendered) {
                    var el = this.cmpEl;

                    this._input = this.cmpEl.find('input').andSelf().filter('input');

                    if (this.editable) {
                        this._input.on('blur',   _.bind(this.onInputChanged, this));
                        this._input.on('keypress', _.bind(this.onKeyPress, this));
                        this._input.on('keyup',    _.bind(this.onKeyUp, this));
                        if (this.validateOnChange) this._input.on('input', _.bind(this.onInputChanging, this));
                        if (this.maxLength) this._input.attr('maxlength', this.maxLength);
                    }

                    this.setEditable(this.editable);
                    if (this.disabled)
                        this.setDisabled(this.disabled);

                    if (this._input.closest('.asc-window').length>0)
                        var onModalClose = function() {
                            var errorTip = el.find('.input-error').data('bs.tooltip');
                            if (errorTip) errorTip.tip().remove();
                            Common.NotificationCenter.off({'modal:close': onModalClose});
                        };
                        Common.NotificationCenter.on({'modal:close': onModalClose});
                }

                me.rendered = true;

                return this;
            },

            _doChange: function(e, extra) {
                // skip processing for internally-generated synthetic event
                // to avoid double processing
                if (extra && extra.synthetic)
                    return;

                var newValue = $(e.target).val(),
                    oldValue = this.value;

                this.trigger('changed:before', this, newValue, oldValue, e);

                if (e.isDefaultPrevented())
                    return;

                this.value = newValue;
                if (this.validateOnBlur)
                    this.checkValidate();

                // trigger changed event
                this.trigger('changed:after', this, newValue, oldValue, e);
            },

            onInputChanged: function(e, extra) {
                this._doChange(e, extra);
            },

            onInputChanging: function(e, extra) {
                var newValue = $(e.target).val(),
                    oldValue = this.value;

                if (e.isDefaultPrevented())
                    return;

                this.value = newValue;
                if (this.validateOnBlur)
                    this.checkValidate();

                // trigger changing event
                this.trigger('changing', this, newValue, oldValue, e);
            },

            onKeyPress: function(e) {
                this.trigger('keypress:before', this, e);

                if (e.isDefaultPrevented())
                    return;

                if (e.keyCode === Common.UI.Keys.RETURN) {
                    this._doChange(e);
                } else if (this.options.maskExp && !_.isEmpty(this.options.maskExp.source)){
                    var charCode = String.fromCharCode(e.which);
                    if(!this.options.maskExp.test(charCode) && !e.ctrlKey && e.keyCode !== Common.UI.Keys.DELETE && e.keyCode !== Common.UI.Keys.BACKSPACE &&
                        e.keyCode !== Common.UI.Keys.LEFT && e.keyCode !== Common.UI.Keys.RIGHT && e.keyCode !== Common.UI.Keys.HOME &&
                        e.keyCode !== Common.UI.Keys.END && e.keyCode !== Common.UI.Keys.ESC && e.keyCode !== Common.UI.Keys.INSERT ){
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }

                this.trigger('keypress:after', this, e);
            },

            onKeyUp: function(e) {
                this.trigger('keyup:before', this, e);

                if (e.isDefaultPrevented())
                    return;

                this.trigger('keyup:after', this, e);
            },

            setEditable: function(editable) {
                var input = this._input;

                this.editable = editable;

                if (editable && input) {
                    input.removeAttr('readonly');
                    input.removeAttr('data-can-copy');
                } else {
                    input.attr('readonly', 'readonly');
                    input.attr('data-can-copy', false);
                }
            },

            isEditable: function() {
                return this.editable;
            },

            setDisabled: function(disabled) {
                this.disabled = disabled;
                $(this.el).toggleClass('disabled', disabled);
                disabled
                    ? this._input.attr('disabled', true)
                    : this._input.removeAttr('disabled');
            },

            isDisabled: function() {
                return this.disabled;
            },

            setValue: function(value) {
                this.value = value;

                if (this.rendered){
                    this._input.val(value);
                }
            },

            getValue: function() {
                return this.value;
            },

            focus: function() {
                this._input.focus();
            },

            checkValidate: function() {
                var me = this,
                    errors = [];

                if (!me.allowBlank && _.isEmpty(me.value)) {
                    errors.push(me.blankError);
                }

                if (_.isFunction(me.validation)) {
                    var res = me.validation.call(me, me.value);

                    if (res !== true) {
                        errors = _.flatten(errors.concat(res));
                    }
                }

                if (!_.isEmpty(errors)) {
                    if (me.cmpEl.hasClass('error')) {
                        var errorTip = me.cmpEl.find('.input-error').data('bs.tooltip');
                        if (errorTip) {
                            errorTip.options.title = errors.join('\n');
                            errorTip.setContent();
                        }
                        return errors;
                    } else {
                        me.cmpEl.addClass('error');

                        var errorBadge = me.cmpEl.find('.input-error'),
                            modalParents = errorBadge.closest('.asc-window'),
                            errorTip = errorBadge.data('bs.tooltip');

                        if (errorTip) errorTip.tip().remove();
                        errorBadge.attr('data-toggle', 'tooltip');
                        errorBadge.removeData('bs.tooltip');
                        errorBadge.tooltip({
                            title       : errors.join('\n'),
                            placement   : 'cursor'
                        });
                        if (modalParents.length > 0) {
                            errorBadge.data('bs.tooltip').tip().css('z-index', parseInt(modalParents.css('z-index')) + 10);
                        }

                        return errors;
                    }
                } else {
                    me.cmpEl.removeClass('error');
                }

                return true;
            },

            showError: function(errors) {
                var me = this;
                if (!_.isEmpty(errors)) {
                    me.cmpEl.addClass('error');

                    var errorBadge = me.cmpEl.find('.input-error'),
                        modalParents = errorBadge.closest('.asc-window'),
                        errorTip = errorBadge.data('bs.tooltip');

                    if (errorTip) errorTip.tip().remove();
                    errorBadge.attr('data-toggle', 'tooltip');
                    errorBadge.removeData('bs.tooltip');
                    errorBadge.tooltip({
                        title       : errors.join('\n'),
                        placement   : 'cursor'
                    });

                    if (modalParents.length > 0) {
                        errorBadge.data('bs.tooltip').tip().css('z-index', parseInt(modalParents.css('z-index')) + 10);
                    }
                } else {
                    me.cmpEl.removeClass('error');
                }
            }
        }
    })());
});