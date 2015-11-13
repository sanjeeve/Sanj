var arrXmlFiles = [];
var doneXmlFiles = [];
var limit = 5;
//var myCenter=new google.maps.LatLng(0,0);
var map;
var gmarkers = [];
var prevCtry = '';
var lastCtry = '';
var k= 0;

function highlight_country(obj) {
    var country_name = Object.keys(obj)[0];
    var color        = obj[country_name];
    var from_color   = obj['from_color_key'];
    var delay        = obj['delay'];
    
    //DEBUG -> window.console && console.log('## color =>'+color);
    return d3.select('path[data-country-name="' + country_name + '"]')
                          //.style('fill', from_color)
                          .transition()
                          .duration(4000)
                          .style('fill', color);
};
    

function searchAddr(countryName, content, type){
                  
                    var country = countryName;
                    var obj = {};
                    obj[country]    = '#D50058';
                    obj['from_color'] = '#3CBEB1';
                    obj['delay']    = 1000;
                    
                       //DEBUG -> window.console && console.log(obj);

                    if( lastCtry != ''){
                        lastCtry[Object.keys(lastCtry)[0]] = '#3CBEB1';
                        lastCtry['from_color'] = '#8c5b83';
                        obj['delay']    = 3000;
                            //DEBUG ->window.console && console.log(lastCtry);
                        highlight_country(lastCtry);
                    }
                    
                    var prev = {};
                    prev[country] = '#8c5b83';
                    prev['from_color'] = '#D50058';
                    obj['delay']    = 2000;
                        
                    if( prevCtry != ''){    
                        highlight_country(prevCtry);
                           //DEBUG -> window.console && console.log(prevCtry);
                        lastCtry = prevCtry;
                    }
                    
                    highlight_country(obj);
                    prevCtry = prev;
                    k = k+1;
                    
                    setTimeout( function(){
                        $(".pin-info").css('display','block');
                        $("#list-items").prepend('<li>'+content+'</li>').slideDown('slow');
                        
                        if($('#list-items li').length > limit) {
                            $('#list-items li').slice(limit, limit + 1).remove();
                        }
                    }, 3000);
                    
                    
// the "google.maps.GeocoderStatus.OVER_QUERY_LIMIT" can be used to check if we reach the API limit.
}

function fadeInOutMap(country, color){
    var obj = {};
    obj[country] = color;
    map.updateChoropleth(obj);
}

function resizeWindow(){
    var docHeight = $(window).height();
    //var navbar = $(".navbar").height();
    //var footer = $(".footer").height();
    var height = parseInt(docHeight)-100; 
    
    return height;
}

function initialize()
{
    $(document).ready(function() {
          
            map = $("#googleMap")
                .datamap({scope: 'world',
                          responsive: false,
                          geography_config: {
                            //hideAntarctica: true,
                            highlightOnHover: false,
                            popupOnHover: false,
                          },
                          bubble_config: {
                            popupOnHover: false,
                            fillOpacity: 0.75,
                            animate: true,
                            popupOnHover: false,
                            highlightOnHover: false,
                            borderColor: '#D0C4B6',
                            highlightFillColor: '#FFEC38',
                            
                        },
                        fills: {
                            defaultFill: '#3CBEB1'
                        }
                 });
             }); 
    
    
    var height = resizeWindow();   
    //$("#googleMap").height(height);
}

initialize();

window.addEventListener('resize', function(event){
                //map.resize();
            });

function getXMLFiles(){
    $.ajax({
            type:    "POST",
            //data:    {files:JSON.stringify(doneXmlFiles)},
            data:    {},
            url:     "index1.php",
            success: function(response) {
                var jsonResponse    =   $.parseJSON(response);
                var xmlFiles        =   jsonResponse.files;
                var xmlFilesCnt     =   xmlFiles.length;
                
                if( gmarkers.length >0){
                    removeMarkers();
                }
                
                arrXmlFiles = [];
                
                if( xmlFilesCnt > 0){
                    for(var i=0; i<xmlFilesCnt; i++){
                        //if($.inArray(xmlFiles[i], doneXmlFiles) ==-1)
                            arrXmlFiles.push(xmlFiles[i]);
                    }
                }
                
                    //DEBUG -> window.console && console.log(arrXmlFiles);
                readXmlFiles();
            },
            error: function (xhr, status, error) {
                readXmlFiles();
            }
          });
}

var t, i=0;
function readXmlFiles(){
    
    var arrXmlFilesCnt = arrXmlFiles.length;
  
   if(arrXmlFilesCnt > 0){
       var fileName = arrXmlFiles[0];
       $.ajax({ url:'xml_files/'+fileName,
                dataType: "xml",
                cache: false,
                success: function(response){
                        //DEBUG -> window.console && console.log('Response =>'+response);
                    
                    if( response != null) {
                        if( fileName.indexOf('NewStudentRegistrationCBA_') > 0) {
                                //DEBUG -> window.console && console.log('New student registration');
                                //DEBUG -> window.console && console.log(fileName);

                            parseStudentRegistration(response);


                        } else if( fileName.indexOf('NewExamSchedule_')  > 0) {
                                //DEBUG -> window.console && console.log('New exam schedule');
                            parseExamSchedule(response);


                        }

                        if($.inArray(fileName, doneXmlFiles) ==-1) 
                            doneXmlFiles.push(fileName);

                        arrXmlFiles.splice($.inArray(fileName,arrXmlFiles),1);

                        i = 5000;
                        t = setTimeout( function(){readXmlFiles(); }, i);
                    }
                },
                error: function (xhr, status, error) {
                    //alert(xhr.status);
                    //alert(thrownError);
                        //DEBUG -> window.console && console.log("Error in getting xml files");
                    getXMLFiles();
                }
            });
   } else {
       getXMLFiles();
   }
}

function parseStudentRegistration(xml){
    var publicDetail    = $(xml).find('PublicDetail');
    var privateDetail   = $(xml).find('PrivateDetail');
    var country         = $(xml).find('PublicDetail').find('ContactCountry').text();
    var contactId       = privateDetail.find('ContactId').text();
    var firstName       = privateDetail.find('FirstName').text() || '';
    var lastName        = privateDetail.find('LastName').text() || '';
    var eventTime       = $(xml).find('EventTime').text() || '';
    
    var content         = eventTime+' '
    content             += 'Someone in '
                         + country
                         + ' registered as a CIMA student ';
    //window.console && console.log('Country =>'+country);
    searchAddr(country,content,'sr');
}

function parseExamSchedule(xml){
    var publicDetail    = $(xml).find('PublicDetail');
    var privateDetail   = $(xml).find('PrivateDetail');
    var country         = $(xml).find('PublicDetail').find('VenueCountry').text();
    
    var contactId       = privateDetail.find('ContactId').text();
    var firstName       = privateDetail.find('FirstName').text() || '';
    var lastName        = privateDetail.find('LastName').text() || '';
    var venueName       = privateDetail.find('VenueName').text();
    var examSubject     = privateDetail.find('ExamSubject').text();
    var eventTime       = $(xml).find('EventTime').text() || '';
            
    
    var content         = eventTime+' '
    content             += 'Someone in '
                         + country+' '
                         + 'scheduled a CIMA exam for '
                         + examSubject;
                         
    //window.console && console.log('Country =>'+country);
    searchAddr(country,content,'es');
}
getXMLFiles();
