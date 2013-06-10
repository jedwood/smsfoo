$(document).ready(function(){

  $('#get-forms').click(function(event) {
    event.preventDefault();
    $('#get-forms').addClass('disabled').html("loading...");
    $.post( '/wuforms', {subdomain: $('#subdomain').val(), apiKey: $('#apikey').val()}, function(data, textStatus) {
      var dropDown = '<option selected>select a form...</option>';
      for (var i=0; i<data.length; i++) {
        dropDown += '<option value="' + data[i].Hash + '"> ' + data[i].Name + '</option>';
      }
      $('#wuforms').html(dropDown);
      $('#forms-wrapper, #sms-enable, #nickname-wrapper').removeClass('hide');
      $('#get-forms, #subdomain-wrapper, #apikey-wrapper').addClass('hide');
    });
    return false;
  });

  $('#sms-enable').click(function(event) {
    event.preventDefault();
    $.post( '/smsify', {subdomain: $('#subdomain').val(), apiKey: $('#apikey').val(), nickname: $('#nickname').val(), hash: $('#wuforms').val()}, function(data, textStatus) {
      $('#form-creds').html("<h4>Ready!</h4><p class='happy'>Text <i>" + data.nickname + "</i> to <b>" + data.phone + "</b>.");
    });
    return false;
  });

});
