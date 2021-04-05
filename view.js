// ---- Define your dialogs  and panels here ----
var panel_p = "panel_p";
var perm_p = define_new_effective_permissions(panel_p, add_info_col = true, which_permissions = null)
$('#sidepanel').append(perm_p)
$('#panel_p').attr('filepath', '/C')
var select_s = "select_s"
var button_text = "Select User to View Permission"
var newUserSelect = define_new_user_select_field(select_s, button_text, on_user_change = function(selected_user){
    $('#panel_p').attr('username', selected_user)
})
$('#sidepanel').append(newUserSelect)
var dialog_d = "dialog_d"
var dialog  = define_new_dialog(dialog_d, title='', options = {})
$('#sidepanel').append(dialog)
$('.fa.fa-info-circle.perm_info').click(function(){
    console.log('clicked');
    console.log($('#panel_p').attr('filepath'))
    console.log($('#panel_p').attr('username'))
    var file_path = $('#panel_p').attr('filepath')
    var username = $('#panel_p').attr('username')
    file_obj = path_to_file[file_path]
    user_obj = all_users[username]
    var permission_to_check = $( this ).attr('permission_name')
  
    var explain = allow_user_action(file_obj, user_obj, permission_to_check, explain_why = true)
    //var explain_text = get_explanation_text(explain)
    var explain_text = get_explanation_text(user_obj, file_obj, permission_to_check, explain)
    $('#dialog_d').text(explain_text)
})

// ---- Display file structure ----


// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
let pathselect =""
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)
    pathselect = perm_dialog.attr('filepath')
    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
