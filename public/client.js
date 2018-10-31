
function sendBet(betID){
    let bettedID = "#" + betID
    console.log(bettedID)
    $(bettedID).submit(function(e) {
      
      // console.log("we're submitting bet with ID " + bettedID)

    var url = "/boob"; // the script where you handle the form input.

    $.ajax({
           type: "POST",
           url: url,
           data: $(bettedID).serialize(), // serializes the form's elements.
           success: function(data)
           {  
               $(bettedID).parent().hide()
               // alert(data); // show response from the php script.
             
           }
         });

    e.preventDefault(); // avoid to execute the actual submit of the form.
});
  
}


function boobs(id){
  console.log(id)
  
}

var passWordField = document.getElementById('password')
var passWordConfirmField = document.getElementById('password_conf')
var form = document.getElementById('login')
function validateMyForm(){
  if(passWordField.value != passWordConfirmField.value){ 
      alert("Passwords do not match. Please try again.");
    } else {
      form.submit()
    }
}