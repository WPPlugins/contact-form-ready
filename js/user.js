var within_wplc = false;
var recaptcha_can_continue = new Array();
var recaptcha_loaded = new Array();
var recaptcha_callbacks = new Array();
var recaptcha_widgets = new Array();


var wpcf_onloadCallback = function() {
	wpcf_initiatereCaptcha();
};

function wpcf_initiatereCaptcha() {

	jQuery('.wpcf_nd').each(function(i, obj) {

	    var current_cfid = jQuery(this).attr('cfid');
	    /* set true to default (when reCaptcha is not enabled */
	    recaptcha_can_continue[current_cfid] = true;

	    if (typeof recaptcha_loaded[current_cfid] === "undefined") {
	    	/* not loaded, lets load it */
	    	if (jQuery('#wpcf_g_recaptcha_'+current_cfid).length > 0) {
	    		

				
			        recaptcha_widgets[current_cfid] = grecaptcha.render('wpcf_g_recaptcha_'+current_cfid, {
			          'sitekey' : wpcf_recaptcha_api,
			          'callback' : wpcf_verifyCallback,
			        });
			        
			        recaptcha_can_continue[current_cfid] = false;
			        recaptcha_loaded[current_cfid] = true;
			        


					

			  	
		  	}
	    } else {
	    	/** already loaded */
	    }
	});
	
}


if (typeof wpcf_recaptcha_enabled !== "undefined" && typeof wpcf_recaptcha_api !== "undefined") {
	
	/*wpcf_initiatereCaptcha();*/
	
}

var wpcf_verifyCallback = function(response, current_cfid) {
	
	/**
	 * Run through each form again and get the response (if exists) of each reCapatcha
	 */
	jQuery('.wpcf_nd').each(function(i, obj) {
		var current_cfid = jQuery(this).attr('cfid');

		var check_response = grecaptcha.getResponse(recaptcha_widgets[current_cfid]);
		if (check_response.length > 0) {
			/**
			 * Set the bool to true so we dont block the sending of the form
			 */
			recaptcha_can_continue[current_cfid] = true;
		}
		

	});
	

	
}


jQuery(document).ready(function() {        


	/**
	 * Trigger to set the reCaptcha for WPLCS users
	 */
	jQuery(document).on("wplc_animation_done", function() {
		wpcf_initiatereCaptcha();
	});



	jQuery("body").on("click", "#wp-live-chat-inner #wpcf_nd_submit", function(e) {
		var cfid = jQuery(this).attr('cfid');
		e.preventDefault();

		if (recaptcha_can_continue[cfid]) {
					
			var orig_elem_string = jQuery(this).val();

			jQuery(this).val(wpcf_nd_ajax_sending);
			within_wplc = true;
			

			jQuery("#wp-live-chat-inner #wpcf_nd_submit").attr('disabled', 'disabled');
			jQuery("#wp-live-chat-inner #wpcf_nd").addClass('wpcf_nd_ajax_enabled');
	        formData = new FormData();
			
			var x = jQuery(".wpcf_nd_"+cfid).serializeArray();
		    jQuery.each(x, function(i, field){
		    	
				formData.append(field.name, field.value);
		    });

	    	formData.append('action', 'wpcf_nd_send_ajax');
	    	formData.append('security', wpcf_nd_nonce);
			jQuery.ajax({
				url : wpcf_nd_ajaxurl,
				type : 'POST',
				data : formData,
				cache: false,
				processData: false, 
				contentType: false, 
				success : function(response) {
					if (response !== "1") {
						jQuery(".wpcf_nd_"+cfid).prepend(response);
						jQuery(orig_element).attr('disabled', false);
						jQuery(orig_element).val(orig_elem_string);
					} else {

						if (typeof wpcf_nd_ajax_thank_you !== "undefined") {
							jQuery(".wpcf_nd_"+cfid).html("<div class='wpcf-nd-thank-you'>"+wpcf_nd_ajax_thank_you+"</div>");
						} else {
							jQuery(".wpcf_nd_"+cfid).html("<div class='wpcf-nd-thank-you'>Thank you for your message. We will respond to you as soon as possible.</div>");
						}
					}
				},
				error: function(response) {
					jQuery(".wpcf_nd_"+cfid).html("There was a problem sending the message. Please try again later.");
				}
			});
		} else {
			e.preventDefault();
			jQuery(".wpcf_nd_submit_"+cfid).after("<p>Please complete the reCAPATCHA field first.</p>");


		}
	

		
		

	});


	
	
	


	jQuery("body").on("click", ".wpcf_nd_submit", function(e) {
		var cfid = jQuery(this).attr('cfid');
		if (recaptcha_can_continue[cfid]) {

			if (typeof wpcf_nd_form_type !== "undefined" && wpcf_nd_form_type == '1' && !within_wplc) {
				e.preventDefault();
				var orig_element = this;
				
				var validation_errors = 0;

				jQuery(".form-control").each(function(){	

					var is_present = jQuery(this).attr('required');

					if( typeof is_present !== typeof undefined && is_present !== false ) {
						if( jQuery(this).val() == "" ){

							jQuery(this).css('border', '1px solid red');
							validation_errors++;

						}

					}

				});

				if( validation_errors === 0 ){

					var orig_elem_string = jQuery(this).val();
					jQuery(this).val(wpcf_nd_ajax_sending);
					jQuery(orig_element).attr('disabled', 'disabled');
					
			        formData = new FormData();
				
					var x = jQuery(".wpcf_nd_"+cfid).serializeArray();					

				    jQuery.each(x, function(i, field){
						formData.append(field.name, field.value);
				    });

			    	formData.append('action', 'wpcf_nd_send_ajax');
			    	formData.append('security', wpcf_nd_nonce);
		    	
					jQuery.ajax({
						url : wpcf_nd_ajaxurl,
						type : 'POST',
						data : formData,
						cache: false,
						processData: false, 
						contentType: false, 
						success : function(response) {
							if (response !== "1") {
								jQuery(".wpcf_nd_"+cfid).prepend(response);
								jQuery(orig_element).attr('disabled', false);
								jQuery(orig_element).val(orig_elem_string);
							} else {
								if (typeof wpcf_nd_ajax_thank_you !== "undefined") {
									jQuery(".wpcf_nd_"+cfid).html("<div class='wpcf-nd-thank-you'>"+wpcf_nd_ajax_thank_you+"</div>");
								} else {
									jQuery(".wpcf_nd_"+cfid).html("<div class='wpcf-nd-thank-you'>Thank you for your message. We will respond to you as soon as possible.</div>");
								}
								if (typeof wpcf_nd_form_redirect !== "undefined") {
									window.location = wpcf_nd_form_redirect;
								}
							}
						},
						error: function(response) {
							jQuery(".wpcf_nd_"+cfid).html("There was a problem sending the message. Please try again later.");
						}
					});

				}					
					
			}
		} else {
			e.preventDefault();
			jQuery(".wpcf_nd_submit_"+cfid).after("<p>Please complete the reCAPATCHA field first.</p>");

		}
					

		
	});

    if( jQuery(".wpcf_wrapper .required").length > 0 ){

	    jQuery(".wpcf_wrapper .required").each(function( key, val ){

	    	var parent_id = jQuery(this).parent().attr('class');

	    	jQuery("#"+parent_id).attr('required', 'true');
	    	
	    });
	}

});

jQuery( function() {
	jQuery( document ).tooltip({
		items: ".tooltip-element",
		content: function() {
			return jQuery( this ).attr( 'tooltip' );
		}
	});
});