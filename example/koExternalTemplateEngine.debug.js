// Knockout External jQuery Template Engine
// Author: Jim Cowart (primarily tweaking Steve Sanderson's original [and already awesome] template engine)
// License: MIT (http://www.opensource.org/licenses/mit-license)
// Version 1.0
(function(window,undefined){ 
if(typeof ko == "undefined")
{
    throw "You must reference Knockout.js in order for the ko.ExternaljQueryTemplateEngine to work.";
}
else
{
    ko['ExternaljQueryTemplateEngine'] = function () {

        // We want the original jQuery template engine's behavior - with some tweaks to follow
        ko['jqueryTmplTemplateEngine']['call'](this, arguments);

        // By default templates are pulled from the same server path as the html file making the request.
        // If you keep your templates in a separate directory, specify it here as a relative path to the html document making the request
        // For example, /Templates for a sub dir, or ../Templates for going up a dir level and dropping into a Templates folder
        this['templateUrl'] = "",

        //  We want to be able to apply any naming conventions you have for your template resource files without cluttering the name itself up.
        //  So, if you have a convention to name your templates with a ".tpl.html" extension/suffix, then specify ".tpl.html" here
        this['templateSuffix'] = ".html",

        //  If you prefer to prefix your templates with a convention, specify it here.
        this['templatePrefix'] = "",

        //  Allows you to use a default "error" template to display when templates cannot be found.
        //  If you choose to not use the default error template, a js error will be thrown - be sure to use Chrome or Firefox's debugging tools to catch this!
        this['useDefaultErrorTemplate'] = true,

        // The html of the template to use for the default error template
        // Keep in mind this is a 'public' member, so you can override this with your own default error template.
        this['defaultErrorTemplateHtml'] = "<div style='font-style: italic;'>The template could not be loaded.  HTTP Status code: {STATUSCODE}.</div>",

        // allowing you to provide a timeout (in milliseconds) for the template lookup
        this['timeout'] = 0, // by default, timeouts are disabled.  Provide a value other than null or 0 and they will be enabled.

        //  This function is the primary difference between the normal KO jQuery template engine and the external template version.
        //  Since we are lazy-loading templates on-demand, they don't exist in the DOM yet.  We make a request to the server
        //  for the static resource and then place the contents in a new <script> tag, with the id attribute set to the templateId.
        //  That way, the remaining logic behind the default KO jQuery template engine works as if the template existed in the
        //  DOM the entire time.
        this['getTemplateNode'] = function (templateId) {
            var node = document.getElementById(templateId);
            if(node == null)
            {
                var templatePath = this.getTemplatePath(templateId);
                var templateHtml = null;
                $['ajax']({
                    "url":templatePath,
                    "async": false,
                    "dataType": "html",
                    "type": "GET",
                    "timeout": this['timeout'],
                    "success": function(response) { templateHtml = response;},
                    "error": function(exception) {
                        if(this['useDefaultErrorTemplate'])
                            templateHtml = this['defaultErrorTemplateHtml'].replace('{STATUSCODE}', exception.status);
                    }.bind(this)

                })

                if(templateHtml === null)
                    throw new Error("Cannot find template with ID=" + templateId);

                var node = $("<script/>", {
                                             "type": "text/html",
                                             "id":templateId,
                                             "text":templateHtml
                                          })['appendTo']("body");


            }
            return node;
        },

        this.getTemplatePath = function(templateId) {
            var templateFile = this['templatePrefix'] + templateId + this['templateSuffix'];
            var templateSrc = this['templateUrl'] == undefined || this['templateUrl'] == "" ? templateFile : this['templateUrl'] + "/" + templateFile;
            return templateSrc;
        },

        this['setOptions'] = function(options) {
            if(options['templateUrl']) {
                this['templateUrl'] = options['templateUrl'];
            }
            if(options['templatePrefix']) {
                this['templatePrefix'] = options['templatePrefix']
            }
            if(options['templateSuffix']) {
                this['templateSuffix'] = options['templateSuffix']
            }
            if(options['useDefaultErrorTemplate']) {
                this['useDefaultErrorTemplate'] = options['useDefaultErrorTemplate']
            }
            if(options['defaultErrorTemplateHtml']) {
                this['defaultErrorTemplateHtml'] = options['defaultErrorTemplateHtml']
            }
            if(options['timeout']) {
                this['timeout'] = options['timeout']
            }
        }
    };
    ko['ExternaljQueryTemplateEngine'].prototype = new ko['templateEngine']();
    // Giving you an easy handle to set member values like templateUrl, templatePrefix and templateSuffix.
    ko['externaljQueryTemplateEngine'] = new ko['ExternaljQueryTemplateEngine']();
     // overrides the default template engine KO normally wires up.
    ko['setTemplateEngine'](ko['externaljQueryTemplateEngine']);
}})(window);                  
