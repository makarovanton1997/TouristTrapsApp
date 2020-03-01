//ourPage script

let youCanChangeColor = false;

let promise = new Promise(function (resolve, reject) {
    ymaps.ready(['ext.paintOnMap']).then(() => {
        let geolocation = ymaps.geolocation;
        let map = new ymaps.Map('map', {
            center: [55.75, 37.62],
            zoom: 12,
            controls: ['zoomControl']
        }, {
            searchControlProvider: 'yandex#search'
        });
        geolocation.get({
            provider: 'browser',
            mapStateAutoApply: true
        }).then((result) => {
            result.geoObjects.options.set('preset', 'islands#blueCircleIcon');
            map.geoObjects.add(result.geoObjects);
        });
        resolve(map);
    });
});
let myMap;
promise.then(
    result => {
        let styles;
        myMap = result;
        let southWestX;
        let southWestY;
        let northEastX;
        let northEastY;

        function boundOfMap(myMap) {
            southWestX = myMap.getBounds()[0][0];
            southWestY = myMap.getBounds()[0][1];
            northEastX = myMap.getBounds()[1][0];
            northEastY = myMap.getBounds()[1][1];
        }

        let timerID;

        myMap.onmouseup = function () {
            if (paintProcess == null) {
                newParseRouteAndDraw = true;
                getRoutesFromArea(width);
                newParseRouteAndDraw = false;
                setTimeout(() => {
                    clearInterval(timerID)
                }, 1);
            }
        }

        myMap.onmousedown = function () {
            newParseRouteAndDraw = true;
            timerID = setInterval(() =>
                getRoutesFromArea, 800);
        }

// myMap.events.add('boundschange', function (event) {
//     if (event.get('newCenter') != event.get('oldCenter')) {
//         setTimeout(getRoutesFromArea,800);
//     }
// });

        function changeWidth(width) {
            styles.strokeWidth = width;
        }

        let ourGeoObjects = new ymaps.GeoObjectCollection({}, {
            preset: "islands#redCircleIcon",
            strokeWidth: 4,
            geodesic: true
        });

        let changeZoom = false;

        myMap.events.add('boundschange', function (event) {
            if (event.get('newZoom') != event.get('oldZoom')) {
                if (changeZoom == false) {
                    myMap.setZoom(14);
                    changeZoom = true;
                }
                if (myMap.getZoom() <= 9) {
                    width = 0;
                } else if (myMap.getZoom() == 10) {
                    width = 2;
                } else if (myMap.getZoom() == 11) {
                    width = 4;
                } else if (myMap.getZoom() == 12) {
                    width = 6;
                } else if (myMap.getZoom() == 13) {
                    width = 8;
                } else {
                    width = 8;
                }

                youHaveOtherZoom = true;

                getRoutesFromArea(width);

            }
        });

        let HintLayout = ymaps.templateLayoutFactory.createClass(
            "<div class='my-hint'>" +
            "<div class='route-info-table'>" +
            "   <div class='d-flex justify-content-center'>" +
            "       <div><b class='route-name'>{{ properties.routeName }}</b></div>" +
            "   </div>" +
            "   <div class='d-flex justify-content-center'>" +
            "       <div>{{properties.routeShortDescription}}</div>" +
            "   </div>" +
            "</div>" +
            "<div class='stars-outer'>" +
            "  <div class='stars-inner' id='hintRating'></div>" +
            "</div>" +
            "<table class='rating-table'>" +
            "  <tr>" +
            "   <td><span class='number-rating'></span></td>" +
            "  </tr>" +
            "</table>" +
            "</div>", {

                getShape: function () {
                    var el = this.getElement(),
                        result = null;
                    if (el) {
                        var firstChild = el.firstChild;
                        result = new ymaps.shape.Rectangle(
                            new ymaps.geometry.pixel.Rectangle([
                                [0, 0],
                                [firstChild.offsetWidth, firstChild.offsetHeight]
                            ])
                        );
                    }
                    let j = 0;
                    for (let i = 0; i < ourGeoObjects.getLength(); i++) {
                        if (ourGeoObjects.get(i).state._data.hover) {
                            j = i;
                        }
                    }
                    const rating = ourGeoObjects.get(j).properties._data.averageRouteMark;

                    const starPercentage = `${(rating / 5) * 100}%`;

                    $('#hintRating').css({
                        'width': starPercentage
                    });
                    if (rating == 0 || !rating) {
                        $('.number-rating').text("no reviews");
                    } else {
                        $('.number-rating').text(rating.toFixed(1) + " from 5.0");
                    }
                    return result;
                }
            }
        );

        function newDrawPaintVersion2(data, width) {
            for (let i = 0; i < data.length; i++) {

                let temp = data[i].routeID;

                arrNeedIndex.push(temp);
                if (arrIndexInArea.indexOf(temp) == -1) {
                    console.log(width);
                    let routePhotos = data[i].photos;
                    let arrPoints = [];
                    let routeName = data[i].routeName;
                    let routeShortDescription = data[i].routeShortDescription;
                    let routeFullDescription = data[i].routeFullDescription;
                    let averageRouteMark = data[i].averageRouteMark;
                    let reviews = data[i].reviews;
                    let colorFromDB = data[i].color;
                    for (let j = 0; j < data[i].points.length; j++) {
                        let cellPoints = new Array(2);
                        cellPoints[0] = data[i].points[j].pointX;
                        cellPoints[1] = data[i].points[j].pointY;
                        arrPoints[j] = cellPoints;
                    }
                    styles =
                        {
                            strokeColor: colorFromDB,
                            strokeOpacity: 0.6,
                            strokeWidth: width,
                            fillColor: colorFromDB,
                            fillOpacity: 0.3,
                            hintLayout: HintLayout
                        };
                    geoObject = new ymaps.Polyline(arrPoints, {
                        routeName: routeName,
                        routeShortDescription: routeShortDescription,
                        routeFullDescription: routeFullDescription,
                        averageRouteMark: averageRouteMark,
                        routeID: temp,
                        routePhotos: routePhotos,
                        reviews: reviews
                    }, styles);
                    ourGeoObjects.add(geoObject);

                    myMap.geoObjects.add(ourGeoObjects);

                    setOnClick();
                }

            }
        }

        function parserRoutesAndPaint(data, width) {

            if (newParseRouteAndDraw == true) {
                newDrawPaintVersion2(data, width);

                arrIndexInArea = arrNeedIndex;
                arrNeedIndex = [];
            }

            let iterator = ourGeoObjects.getIterator(),
                object;
            while ((object = iterator.getNext()) != iterator.STOP_ITERATION) {
                myMap.geoObjects.remove(object);
            }
            ourGeoObjects.removeAll();
            for (let i = 0; i < data.length; i++) {
                let temp = data[i].routeID;
                let routePhotos = data[i].photos;
                let arrPoints = [];
                let routeName = data[i].routeName;
                let routeShortDescription = data[i].routeShortDescription;
                let routeFullDescription = data[i].routeFullDescription;
                let averageRouteMark = data[i].averageRouteMark;
                let reviews = data[i].reviews;
                let colorFromDB = data[i].color;
                for (let j = 0; j < data[i].points.length; j++) {
                    let cellPoints = new Array(2);
                    cellPoints[0] = data[i].points[j].pointX;
                    cellPoints[1] = data[i].points[j].pointY;
                    arrPoints[j] = cellPoints;
                }

                styles =
                    {
                        strokeColor: colorFromDB,
                        strokeOpacity: 0.6,
                        strokeWidth: width,
                        fillColor: colorFromDB,
                        fillOpacity: 0.3,
                        hintLayout: HintLayout
                    };

                geoObject = new ymaps.Polyline(arrPoints, {
                    routeName: routeName,
                    routeShortDescription: routeShortDescription,
                    routeFullDescription: routeFullDescription,
                    averageRouteMark: averageRouteMark,
                    routeID: temp,
                    routePhotos: routePhotos,
                    reviews: reviews
                }, styles);
                ourGeoObjects.add(geoObject);
            }

            myMap.geoObjects.add(ourGeoObjects);
            if (youHaveOtherZoom == true) {
                myMap.geoObjects.remove(tempRoute);
                tempRoute = new ymaps.Polyline(fullCoord, {}, {
                    strokeColor: $('#initColorPalette').val(),
                    strokeOpacity: 0.6,
                    strokeWidth: width,
                    fillColor: $('#initColorPalette').val(),
                    fillOpacity: 0.3,
                    hintLayout: HintLayout
                });
                tempColor = $('#initColorPalette').val();
                myMap.geoObjects.add(tempRoute);
            }
            youHaveOtherZoom = false;
            setOnClick();
        }

        function setOnClick() {

            for (let i = 0; i < ourGeoObjects.getLength(); i++) {
                let routeID = ourGeoObjects.get(i).properties._data.routeID;
                ourGeoObjects.get(i).events.add("click", function () {
                    $('#routeInfoModal').modal('show');

                    function showalert(message, alerttype) {

                        $('#alert_placeholder').append('<div id="alertdiv" class="alert ' + alerttype + '"><a class="close" data-dismiss="alert">×</a><span>' + message + '</span></div>')

                        setTimeout(function () { // this will automatically close the alert and remove this if the users doesnt close it in 5 secs


                            $("#alertdiv").remove();

                        }, 5000);
                    }

                    $('#reviewService').collapse('hide');
                    $('#toggl-btn').on('click', function () {
                        if ($('#toggl-btn').text() == "Cancel") {
                            $('#toggl-btn').text("Add new review");
                            $('#reviewTextArea').val("");
                            $('#star-rating-1').attr("checked", true);
                            $('#star-rating-1').attr("checked", false);
                            $('#star-rating-2').attr("checked", true);
                            $('#star-rating-2').attr("checked", false);
                            $('#star-rating-3').attr("checked", true);
                            $('#star-rating-3').attr("checked", false);
                            $('#star-rating-4').attr("checked", true);
                            $('#star-rating-4').attr("checked", false);
                            $('#star-rating-5').attr("checked", true);
                            $('#star-rating-5').attr("checked", false);
                            $('#star-rating-0').attr("checked", true);
                            $('#star-rating-0').attr("checked", false);
                            $('#reviewService').collapse('hide');
                        } else {
                            $('#toggl-btn').text("Cancel");
                            $('#reviewService').collapse('show');
                        }
                    });
                    $("label[for='star-rating-0']").css('display', 'none');
                    $('#addReviewBtn').off('click');
                    $('#addReviewBtn').on('click', function () {
                        let reviewText = $("#reviewTextArea").val();
                        let mark;
                        if (!$("#routeForm input[type='radio']:checked").val()) {
                            mark = 0.0;
                        } else {
                            mark = $("#routeForm input[type='radio']:checked").val();
                        }
                        let ourRouteID = route.properties._data.routeID;
                        let userID = signInData.user.userID;
                        $.getJSON('http://localhost:8080/valid/validReview?userID=' + userID + '&routeID=' + ourRouteID
                            + '&reviewText=' + reviewText + '&routeMark=' + mark, function (data) {
                            if (!data.routeMark) {
                                showalert("You must select a route mark!", 'alert-danger');
                            } else if (!data.reviewText) {
                                showalert("Route text must have <= 255 symbols!", 'alert-danger');
                            } else if (!data.userID) {
                                showalert("You can write only one review to the route!", 'alert-danger');
                            } else {
                                $.ajax({
                                    url: 'http://localhost:8080/reviews/addReview',
                                    type: 'POST',
                                    data: {
                                        userID: userID,
                                        routeID: ourRouteID,
                                        routeMark: mark,
                                        reviewText: reviewText
                                    },
                                    success:
                                        function () {
                                            $.getJSON('http://localhost:8080/reviews/' + route.properties._data.routeID + '/getMark', function (data) {
                                                console.log(data);
                                                $('#routeRatingInfo').css({
                                                    'width': `${(data / 5) * 100}%`
                                                });
                                                $('#rating-num').text(data.toFixed(1) + " from 5.0");
                                                $.getJSON('http://localhost:8080/reviews/findByRouteID/' + route.properties._data.routeID, function (d) {
                                                    let UPDMark = 0;
                                                    for (let i = 0; i < d.length; i++) {
                                                        UPDMark += d[i].routeMark;
                                                    }
                                                    route.properties._data.averageRouteMark = UPDMark / d.length;
                                                    workWithReviews(route, d);
                                                });
                                            });
                                        },
                                    error: function () {
                                        $('#toastOfError').toast('show');
                                    }

                                });
                                $('#reviewTextArea').val("");
                                $('#star-rating-1').attr("checked", true);
                                $('#star-rating-1').attr("checked", false);
                                $('#star-rating-2').attr("checked", true);
                                $('#star-rating-2').attr("checked", false);
                                $('#star-rating-3').attr("checked", true);
                                $('#star-rating-3').attr("checked", false);
                                $('#star-rating-4').attr("checked", true);
                                $('#star-rating-4').attr("checked", false);
                                $('#star-rating-5').attr("checked", true);
                                $('#star-rating-5').attr("checked", false);
                                $('#star-rating-0').attr("checked", true);
                                $('#star-rating-0').attr("checked", false);
                                $('#toggl-btn').text("Add new review");
                                $('#reviewService').collapse('hide');
                                // $('#cancelRouteInfo').click();
                                //$('#ReviewModal').modal('show');
                            }
                        });
                    });

                    if (signInData.user) {

                        $('#del-my-route').css("display", "none");
                        $('#update-my-route').css("display", "none");

                        $.getJSON('http://localhost:8080/routes/findByUserIDAndRouteID/' + signInData.user.userID + '/'
                            + routeID, function (data) {
                            if (!data) {
                                $('#del-my-route').css("display", "none");
                            } else {
                                $('#del-my-route').css("display", "block");
                                $('#update-my-route').css("display", "block");
                                $('#del-my-route').off("click");
                                $('#del-my-route').on("click", function () {
                                    $.ajax({
                                        url: 'http://localhost:8080/routes/' + routeID,
                                        type: 'DELETE',
                                        success: function (data) {
                                            $('#routeEditModal').modal('hide');
                                            $('#cancelRouteInfo').click();
                                            $('#routeModalDel').modal('show');
                                        }

                                    });
                                    // $('#routeEditModal').modal('hide');
                                    //  $('#cancelRouteInfo').click();
                                    //  $('#RouteModalDel').modal('show');
                                    $('#toggl-btn2').text("Edit my review");
                                    $('#reviewService2').collapse('hide');
                                });


                            }
                        });
                    }

                    $('#prev3reviews').off("click");
                    $('#next3reviews').off("click");
                    $('#prevPhoto').off("click");
                    $('#nextPhoto').off("click");
                    $('#routeInfoModalLabel').text(ourGeoObjects.get(i).properties._data.routeName);
                    const rating = ourGeoObjects.get(i).properties._data.averageRouteMark;

                    const starPercentage = `${(rating / 5) * 100}%`;

                    $('#routeRatingInfo').css({
                        'width': starPercentage
                    });
                    if (rating == 0 || !rating) {
                        $('#rating-num').text("no reviews");
                    } else {
                        $('#rating-num').text(rating.toFixed(1) + " from 5.0");
                    }
                    $('#short-desc').text(ourGeoObjects.get(i).properties._data.routeShortDescription);
                    $('#full-desc').text(ourGeoObjects.get(i).properties._data.routeFullDescription);
                    route = ourGeoObjects.get(i);
                    let photos = ourGeoObjects.get(i).properties._data.routePhotos;
                    if (photos.length == 0) {
                        $("#prevPhoto").css("display", "none");
                        $("#nextPhoto").css("display", "none");
                        $('#photos').html('<div class="d-flex justify-content-center">There are no photos</div>');
                    } else {
                        $("#prevPhoto").css("display", "block");
                        $("#nextPhoto").css("display", "block");
                        $('#photos').html('<img class="route-img" id="photoIm">');
                        $('#photoIm').attr("src", /img/ + photos[0].photoName);
                        if (photos.length == 1) {
                            $("#prevPhoto").css("display", "none");
                            $("#nextPhoto").css("display", "none");
                        } else {
                            $("#prevPhoto").css("display", "block");
                            $("#nextPhoto").css("display", "block");
                        }
                        $('#prevPhoto').attr("disabled", true);
                        $("#nextPhoto").attr("disabled", false);
                        let l = 0;
                        $('#nextPhoto').on('click', function () {
                            l++;
                            $('#prevPhoto').attr("disabled", false);
                            if (l == photos.length - 1) {
                                $('#nextPhoto').attr("disabled", true);
                            } else {
                                $('#nextPhoto').attr("disabled", false);
                            }
                            $('#photos').html('<img class="route-img" id="photoIm">');
                            $('#photoIm').attr("src", /img/ + photos[l].photoName);
                        });
                        $('#prevPhoto').on('click', function () {
                            l--;
                            $('#nextPhoto').attr("disabled", false);
                            if (l == 0) {
                                $('#prevPhoto').attr("disabled", true);
                            } else {
                                $('#prevPhoto').attr("disabled", false);
                            }
                            $('#photos').html('<img class="route-img" id="photoIm">');
                            $('#photoIm').attr("src", /img/ + photos[l].photoName);
                        });
                    }
                    workWithReviews(ourGeoObjects.get(i), ourGeoObjects.get(i).properties._data.reviews);

                });

            }
        }

        function workWithReviews(thisRoute, reviews) {
            $('#my-rev').css("display", "none");
            $('#prev3reviews').css("display", "none");
            $('#next3reviews').css("display", "none");
            $('#prev3reviews').off('click');
            $('#next3reviews').off('click');
            if (signInData.user) {


                $.getJSON('http://localhost:8080/reviews/' + thisRoute.properties._data.routeID + '/' + signInData.user.userID,
                    function (data) {
                        if (data.length == 0) {
                            $('#show-my-rev').off("click");
                            $('#show-all-rev').off("click");
                            $('#show-my-rev').css("display", "none");
                            $('#add-rev-col').css("display", "block");
                            $('#all-rev').css("display", "block");
                            $('#show-all-rev').css("display", "none");
                            $('#my-rev').css("display", "none");
                            $('#del-my-rev').css("display", "none");
                            $('#change-my-rev').css("display", "none");
                            if (reviews.length > 3) {
                                $('#prev3reviews').css("display", "block");
                                $('#next3reviews').css("display", "block");
                            } else {
                                $('#prev3reviews').css("display", "none");
                                $('#next3reviews').css("display", "none");
                            }
                        } else {
                            $('#del-my-rev').css("display", "none");
                            $('#change-my-rev').css("display", "none");
                            $('#show-my-rev').off("click");
                            $('#show-my-rev').css("display", "block");
                            $('#add-rev-col').css("display", "none");
                            if (reviews.length > 3) {
                                $('#prev3reviews').css("display", "block");
                                $('#next3reviews').css("display", "block");
                            } else {
                                $('#prev3reviews').css("display", "none");
                                $('#next3reviews').css("display", "none");
                            }
                            $('#all-rev').css("display", "block");
                            $('#show-all-rev').css("display", "none");
                            $('#my-rev').css("display", "none");
                            $('#show-my-rev').on("click", function () {
                                $('#del-my-rev').css("display", "block");
                                $('#change-my-rev').css("display", "block");
                                $('#my-rev').css("display", "block");
                                $('#all-rev').css("display", "none");
                                $('#prev3reviews').css("display", "none");
                                $('#next3reviews').css("display", "none");
                                $('#show-my-rev').css("display", "none");
                                $('#show-all-rev').css("display", "block");
                                $.getJSON('http://localhost:8080/reviews/' + thisRoute.properties._data.routeID + '/' + signInData.user.userID,
                                    function (data) {
                                        $.getJSON('http://localhost:8080/users/' + data[0].userID, function (d) {
                                            $('#my-review-name').text(d.userName);
                                        });
                                        $('#my-review-date').text(data[0].reviewDate);
                                        const starPercentage = `${(data[0].routeMark / 5) * 100}%`;
                                        $('#my-review-rate').css({
                                            'width': starPercentage
                                        });

                                        if (!data[0].reviewText) {
                                            $('#my-rev-text').css("display", "none");
                                        } else {
                                            $('#my-rev-text').css("display", "block");
                                            $('#my-review-textt').text(data[0].reviewText);
                                        }
                                    });

                            });


                            $('#del-my-rev').off("click");
                            $('#del-my-rev').on("click", function () {
                                $.ajax({
                                    url: 'http://localhost:8080/reviews/deleteReview/' + data[0].reviewID,
                                    type: 'DELETE',
                                    success: function (data) {
                                        $('#del-my-rev').css("display", "none");
                                        $('#change-my-rev').css("display", "none");
                                        if (reviews.length == 1) {
                                            $('#routeRatingInfo').css({
                                                'width': `${0}%`
                                            });
                                            $('#rating-num').text("no reviews");
                                        }
                                        $.getJSON('http://localhost:8080/reviews/' + route.properties._data.routeID + '/getMark', function (data) {
                                            console.log("mark ", data);
                                            $('#routeRatingInfo').css({
                                                'width': `${(data / 5) * 100}%`
                                            });
                                            $('#rating-num').text(data.toFixed(1) + " from 5.0");


                                        });
                                        $.getJSON('http://localhost:8080/reviews/findByRouteID/' + route.properties._data.routeID, function (data) {
                                            $('#show-all-rev').css("display", "none");
                                            $('#show-all-rev').click();
                                            $('#show-my-rev').css("display", "none");
                                            $('#add-rev-col').css("display", "block");
                                            reviews = data;
                                            $('#my-rev').css("display", "none");
                                            $('#prev3reviews').css("display", "none");
                                            $('#next3reviews').css("display", "none");
                                            if (reviews.length == 0) {
                                                $("#list-rev-1").css("display", "none");
                                                $("#list-rev-2").css("display", "none");
                                                $("#list-rev-3").css("display", "none");
                                                $("#next3reviews").css("display", "none");
                                                $("#prev3reviews").css("display", "none");
                                                $('#noreview').html('<div class="col-md-auto">There are no reviews</div>');
                                            } else {
                                                $('#noreview').html('<div></div>');
                                                $("#list-rev-1").css("display", "block");
                                                $("#list-rev-2").css("display", "block");
                                                $("#list-rev-3").css("display", "block");
                                                $("#next3reviews").css("display", "block");
                                                $("#prev3reviews").css("display", "block");
                                                reviews.sort(function (a, b) {
                                                    return b.reviewID - a.reviewID
                                                });
                                                j = 0;
                                                k = 3;
                                                $("#prev3reviews").attr("disabled", true);
                                                $("#next3reviews").attr("disabled", false);
                                                if (reviews.length < 3) {
                                                    k = reviews.length;
                                                    for (let h = k + 1; h <= 3; h++) {
                                                        $('#' + 'list-rev-' + h).css("display", "none");
                                                    }
                                                }
                                                if (reviews.length <= 3) {
                                                    $("#next3reviews").css("display", "none");
                                                    $("#prev3reviews").css("display", "none");
                                                } else {
                                                    $("#next3reviews").css("display", "block");
                                                    $("#prev3reviews").css("display", "block");
                                                    for (let h = 1; h <= 3; h++) {
                                                        $('#' + 'list-rev-' + h).css("display", "block");
                                                    }
                                                }
                                                for (let z = 0; z < k; z++) {
                                                    $.getJSON('http://localhost:8080/users/' + reviews[z].userID, function (data) {
                                                        $('#' + 'review-name-' + (z + 1)).text(data.userName);
                                                    });
                                                    $('#' + 'review-date-' + (z + 1)).text(reviews[z].reviewDate);

                                                    const starPercentage = `${(reviews[z].routeMark / 5) * 100}%`;

                                                    $('#' + 'review-rate-' + (z + 1)).css({
                                                        'width': starPercentage
                                                    });

                                                    if (!reviews[z].reviewText) {
                                                        $('#' + 'rev-text-' + (z + 1)).css("display", "none");
                                                    } else {
                                                        $('#' + 'rev-text-' + (z + 1)).css("display", "block");
                                                        $('#' + 'review-text-' + (z + 1)).text(reviews[z].reviewText);
                                                    }
                                                }
                                            }

                                        });
                                    },
                                    error: function () {
                                        $('#toastOfError').toast('show');
                                    }
                                });
                                // $('#cancelRouteInfo').click();
                                // $('#ReviewModalDel').modal('show');
                                // $('#toggl-btn2').text("Edit my review");
                                //$('#reviewService2').collapse('hide');
                                //$('#cancelRouteInfo').click();
                            });


                            //script updating review
                            function showalert2(message, alerttype) {

                                $('#alert_placeholder2').append('<div id="alertdiv2" class="alert ' + alerttype + '"><a class="close" data-dismiss="alert">×</a><span>' + message + '</span></div>')

                                setTimeout(function () { // this will automatically close the alert and remove this if the users doesnt close it in 5 secs


                                    $("#alertdiv2").remove();

                                }, 5000);
                            }

                            $('#reviewService2').collapse('hide');
                            $('#toggl-btn2').on('click', function () {
                                if ($('#toggl-btn2').text() == "Cancel") {

                                    $('#reviewTextArea2').val("");
                                    $('#star-rating-12').attr("checked", true);
                                    $('#star-rating-12').attr("checked", false);
                                    $('#star-rating-22').attr("checked", true);
                                    $('#star-rating-22').attr("checked", false);
                                    $('#star-rating-32').attr("checked", true);
                                    $('#star-rating-32').attr("checked", false);
                                    $('#star-rating-42').attr("checked", true);
                                    $('#star-rating-42').attr("checked", false);
                                    $('#star-rating-52').attr("checked", true);
                                    $('#star-rating-52').attr("checked", false);
                                    $('#star-rating-02').attr("checked", true);
                                    $('#star-rating-02').attr("checked", false);
                                    $('#toggl-btn2').text("Edit my review");
                                    $('#reviewService2').collapse('hide');

                                } else {
                                    $('#reviewService2').collapse('show');
                                    $('#toggl-btn2').text("Cancel");
                                }
                            });
                            $("label[for='star-rating-02']").css('display', 'none');
                            $('#addReviewBtn2').off('click');
                            $('#addReviewBtn2').on('click', function () {
                                let reviewText = $("#reviewTextArea2").val();
                                let mark;
                                if (!$("#routeForm2 input[type='radio']:checked").val()) {
                                    mark = 0.0;
                                } else {
                                    mark = $("#routeForm2 input[type='radio']:checked").val();
                                }
                                let ourRouteID2 = route.properties._data.routeID;
                                let ourReviewID = data[0].reviewID;
                                let oldMark = route.properties._data.averageRouteMark;

                                let revIndex;
                                for (let i = 0; i < reviews.length; i++) {
                                    if (reviews[i].reviewID == ourReviewID) {
                                        if (mark) {
                                            reviews[i].routeMark = parseFloat(mark);
                                        }
                                        if (reviewText) {
                                            reviews[i].reviewText = reviewText;
                                        }
                                        revIndex = i;
                                    }
                                }

                                let userID = signInData.user.userID;
                                $.getJSON('http://localhost:8080/valid/validReview?userID=' + userID + '&routeID=' + ourRouteID2
                                    + '&reviewText=' + reviewText + '&routeMark=' + mark, function (data) {
                                    if (!data.reviewText) {
                                        showalert("Route text must have <= 255 symbols!", 'alert-danger');
                                    } else {
                                        $.ajax({
                                            url: 'http://localhost:8080/reviews/updateReview/' + ourReviewID,
                                            type: 'PUT',
                                            data: {routeMark: mark, reviewText: reviewText},
                                            /*error: function () {
                                                $('#toastOfError').toast('show');
                                            }*/
                                            success:
                                                $.getJSON('http://localhost:8080/reviews/' + ourRouteID2 + '/getMark', function (data) {
                                                    console.log(oldMark + " " + data);
                                                    if (data != oldMark && reviews.length != 1) {
                                                        $('#routeRatingInfo').css({
                                                            'width': `${(data / 5) * 100}%`
                                                        });
                                                        $('#rating-num').text(data.toFixed(1) + " from 5.0");
                                                        route.properties._data.averageRouteMark = data;
                                                    } else if (reviews.length != 1) {
                                                        let newMark = 0;
                                                        console.log(reviews);
                                                        for (let i = 0; i < reviews.length; i++) {
                                                            newMark += reviews[i].routeMark;
                                                        }
                                                        newMark /= reviews.length;
                                                        console.log("new " + newMark);
                                                        $('#routeRatingInfo').css({
                                                            'width': `${(newMark / 5) * 100}%`
                                                        });
                                                        $('#rating-num').text(newMark.toFixed(1) + " from 5.0");
                                                        route.properties._data.averageRouteMark = newMark;
                                                    }
                                                })
                                        });
                                        if (reviews.length == 1) {
                                            console.log("len 1 " + mark)
                                            $('#routeRatingInfo').css({
                                                'width': `${(mark / 5) * 100}%`
                                            });
                                            $('#rating-num').text(mark + ".0 from 5.0");
                                            route.properties._data.averageRouteMark = mark;
                                        }
                                        $('#reviewTextArea2').val("");
                                        $('#star-rating-12').attr("checked", true);
                                        $('#star-rating-12').attr("checked", false);
                                        $('#star-rating-22').attr("checked", true);
                                        $('#star-rating-22').attr("checked", false);
                                        $('#star-rating-32').attr("checked", true);
                                        $('#star-rating-32').attr("checked", false);
                                        $('#star-rating-42').attr("checked", true);
                                        $('#star-rating-42').attr("checked", false);
                                        $('#star-rating-52').attr("checked", true);
                                        $('#star-rating-52').attr("checked", false);
                                        $('#star-rating-02').attr("checked", true);
                                        $('#star-rating-02').attr("checked", false);
                                        //   $('#toggl-btn2').text("Edit my review");
                                        $('#reviewService2').collapse('hide');
                                        if (mark) {
                                            $('#my-review-rate').css({
                                                'width': `${(mark / 5) * 100}%`
                                            });
                                        }
                                        if (reviewText) {
                                            $('#my-rev-text').css("display", "block");
                                            $('#my-review-textt').text(reviewText);
                                        }

                                        for (let i = 1; i <= 3; i++) {
                                            if ($('#' + 'review-name-' + i).text() == signInData.user.userName) {
                                                const starPercentage = `${(reviews[revIndex].routeMark / 5) * 100}%`;

                                                $('#' + 'review-rate-' + i).css({
                                                    'width': starPercentage
                                                });

                                                if (!reviews[revIndex].reviewText) {
                                                    $('#' + 'rev-text-' + i).css("display", "none");
                                                } else {
                                                    $('#' + 'rev-text-' + i).css("display", "block");
                                                    $('#' + 'review-text-' + i).text(reviews[revIndex].reviewText);
                                                }
                                            }
                                        }

                                        $('#toggl-btn2').text("Edit my review");
                                    }
                                });
                                //  $('#toggl-btn2').text("Edit review");
                                // $('#reviewService2').collapse('hide');
                                // $('#cancelRouteInfo').click();
                                // $('#ReviewModal').modal('show');
                            });
                            //end script uptading

                            $('#show-all-rev').off("click");
                            $('#show-all-rev').on("click", function () {
                                $('#del-my-rev').css("display", "none");
                                $('#change-my-rev').css("display", "none");
                                $('#toggl-btn2').text("Edit my review");
                                $('#reviewService2').collapse('hide');

                                $('#all-rev').css("display", "block");
                                $('#my-rev').css("display", "none");
                                if (reviews.length > 3) {
                                    $('#prev3reviews').css("display", "block");
                                    $('#next3reviews').css("display", "block");
                                } else {
                                    $('#prev3reviews').css("display", "none");
                                    $('#next3reviews').css("display", "none");
                                }
                                $('#show-my-rev').css("display", "block");
                                $('#show-all-rev').css("display", "none");
                            });
                        }
                    }
                );

            }
            if (reviews.length == 0) {
                $("#list-rev-1").css("display", "none");
                $("#list-rev-2").css("display", "none");
                $("#list-rev-3").css("display", "none");
                $("#next3reviews").css("display", "none");
                $("#prev3reviews").css("display", "none");
                $('#noreview').html('<div class="col-md-auto">There are no reviews</div>');
            } else {
                $('#noreview').html('<div></div>');
                $("#list-rev-1").css("display", "block");
                $("#list-rev-2").css("display", "block");
                $("#list-rev-3").css("display", "block");
                $("#next3reviews").css("display", "block");
                $("#prev3reviews").css("display", "block");
                reviews.sort(function (a, b) {
                    return b.reviewID - a.reviewID
                });
                let j = 0;
                let k = 3;
                $("#prev3reviews").attr("disabled", true);
                $("#next3reviews").attr("disabled", false);
                if (reviews.length < 3) {
                    k = reviews.length;
                    for (let h = k + 1; h <= 3; h++) {
                        $('#' + 'list-rev-' + h).css("display", "none");
                    }
                }
                if (reviews.length <= 3) {
                    $("#next3reviews").css("display", "none");
                    $("#prev3reviews").css("display", "none");
                } else {
                    $("#next3reviews").css("display", "block");
                    $("#prev3reviews").css("display", "block");
                    for (let h = 1; h <= 3; h++) {
                        $('#' + 'list-rev-' + h).css("display", "block");
                    }
                }
                for (let z = 0; z < k; z++) {
                    $.getJSON('http://localhost:8080/users/' + reviews[z].userID, function (data) {
                        $('#' + 'review-name-' + (z + 1)).text(data.userName);
                    });
                    $('#' + 'review-date-' + (z + 1)).text(reviews[z].reviewDate);

                    const starPercentage = `${(reviews[z].routeMark / 5) * 100}%`;

                    $('#' + 'review-rate-' + (z + 1)).css({
                        'width': starPercentage
                    });

                    if (!reviews[z].reviewText) {
                        $('#' + 'rev-text-' + (z + 1)).css("display", "none");
                    } else {
                        $('#' + 'rev-text-' + (z + 1)).css("display", "block");
                        $('#' + 'review-text-' + (z + 1)).text(reviews[z].reviewText);
                    }
                }
                $('#next3reviews').on('click', function () {
                    j++;
                    k += 3;
                    if (reviews.length < k) {
                        $("#next3reviews").attr("disabled", true);
                        k = reviews.length;
                        for (let h = k - j * 3 + 1; h <= 3; h++) {
                            $('#' + 'list-rev-' + h).css("display", "none");
                        }
                    } else {
                        $("#next3reviews").attr("disabled", false);
                        for (let h = 1; h <= 3; h++) {
                            $('#' + 'list-rev-' + h).css("display", "block");
                        }
                    }
                    if (reviews.length == ((j + 1) * 3)) {
                        $("#next3reviews").attr("disabled", true);

                    }
                    $("#prev3reviews").attr("disabled", false);
                    for (let z = j * 3; z < k; z++) {
                        $.getJSON('http://localhost:8080/users/' + reviews[z].userID, function (data) {
                            $('#' + 'review-name-' + (z - j * 3 + 1)).text(data.userName);
                        });
                        $('#' + 'review-date-' + (z - j * 3 + 1)).text(reviews[z].reviewDate);

                        const starPercentage = `${(reviews[z].routeMark / 5) * 100}%`;

                        $('#' + 'review-rate-' + (z - j * 3 + 1)).css({
                            'width': starPercentage
                        });

                        if (!reviews[z].reviewText) {
                            $('#' + 'rev-text-' + (z - j * 3 + 1)).css("display", "none");
                        } else {
                            $('#' + 'rev-text-' + (z - j * 3 + 1)).css("display", "block");
                            $('#' + 'review-text-' + (z - j * 3 + 1)).text(reviews[z].reviewText);
                        }
                    }
                });

                $('#prev3reviews').on('click', function () {
                    j--;
                    k -= 3;
                    if (k <= 3) {
                        $('#prev3reviews').attr('disabled', true);
                    } else {
                        $('#prev3reviews').attr('disabled', false);
                    }
                    if (k < (j + 1) * 3) {
                        k = (j + 1) * 3;
                    }
                    $("#next3reviews").attr("disabled", false);
                    for (let h = 1; h <= 3; h++) {
                        $('#' + 'list-rev-' + h).css("display", "block");
                    }
                    for (let z = j * 3; z < k; z++) {
                        $.getJSON('http://localhost:8080/users/' + reviews[z].userID, function (data) {
                            $('#' + 'review-name-' + (z - j * 3 + 1)).text(data.userName);
                        });
                        $('#' + 'review-date-' + (z - j * 3 + 1)).text(reviews[z].reviewDate);

                        const starPercentage = `${(reviews[z].routeMark / 5) * 100}%`;

                        $('#' + 'review-rate-' + (z - j * 3 + 1)).css({
                            'width': starPercentage
                        });

                        if (!reviews[z].reviewText) {
                            $('#' + 'rev-text-' + (z - j * 3 + 1)).css("display", "none");
                        } else {
                            $('#' + 'rev-text-' + (z - j * 3 + 1)).css("display", "block");
                            $('#' + 'review-text-' + (z - j * 3 + 1)).text(reviews[z].reviewText);
                        }
                    }
                });
            }
        }

        let converter = (latitude, longitude) => {
            let projection = myMap.options.get('projection');
            let arrPixels = myMap.converter.globalToPage(
                projection.toGlobalPixels(
                    // географические координаты
                    [latitude, longitude],
                    myMap.getZoom()));
            return arrPixels;
        }

        getRoutesFromArea = (width) => {
            boundOfMap(myMap);
            $.getJSON('http://localhost:8080/routes/findRoutesInTheArea?southWestX=' + southWestX
                + '&southWestY=' + southWestY + '&northEastX=' + northEastX
                + '&northEastY=' + northEastY, function (data) {
                parserRoutesAndPaint(data, width);
            });
        }

        getRoutesFromArea(width);

        let paintProcess = null;


// Подпишемся на событие нажатия кнопки мыши.
        myMap.events.add('mousedown', function (e) {
            if (($("#hlpbtn").prop("checked"))) {
                // console.log($('#initColorPalette').val());
                // styles.fillColor = $('#initColorPalette').val();
                paintProcess = ymaps.ext.paintOnMap(myMap, e, {
                    style: {
                        strokeColor: $('#initColorPalette').val(),
                        strokeOpacity: 0.6,
                        strokeWidth: width,
                        fillColor: $('#initColorPalette').val(),
                        fillOpacity: 0.3,
                        hintLayout: HintLayout
                    }
                });
            }
        });


// Подпишемся на событие отпускания кнопки мыши.
        myMap.events.add('mouseup', function (e) {
            if (paintProcess) {
                //Получаем координаты отрисованного контура.
                coordinates = paintProcess.finishPaintingAt(e);
                if (fullCoord.length == 0) {
                    fullCoord = fullCoord.concat(coordinates);
                    paintProcess = null;
                    tempRoute = new ymaps.Polyline(fullCoord, {}, {
                        strokeColor: $('#initColorPalette').val(),
                        strokeOpacity: 0.6,
                        strokeWidth: width,
                        fillColor: $('#initColorPalette').val(),
                        fillOpacity: 0.3,
                        hintLayout: HintLayout
                    });
                    tempColor = $('#initColorPalette').val();
                    // tempRoute = {};
                    myMap.geoObjects.add(tempRoute);


                } else {
                    let lastArrOfFullCoord = fullCoord[fullCoord.length - 1];
                    let arrPixEnd = converter(lastArrOfFullCoord[0], lastArrOfFullCoord[1]);
                    let firstArrOfOurCoord = coordinates[0];
                    let arrPixBegin = converter(firstArrOfOurCoord[0], firstArrOfOurCoord[1]);
                    let answer = Math.sqrt(Math.pow(arrPixEnd[0] - arrPixBegin[0], 2) +
                        Math.pow(arrPixEnd[1] - arrPixBegin[1], 2));
                    if (answer < 17.9102059583619) {
                        fullCoord = fullCoord.concat(coordinates);
                        paintProcess = null;
                        myMap.geoObjects.remove(tempRoute);
                        tempRoute = new ymaps.Polyline(fullCoord, {}, {
                            strokeColor: $('#initColorPalette').val(),
                            strokeOpacity: 0.6,
                            strokeWidth: width,
                            fillColor: $('#initColorPalette').val(),
                            fillOpacity: 0.3,
                            hintLayout: HintLayout
                        });
                        tempColor = $('#initColorPalette').val();
                        myMap.geoObjects.add(tempRoute);
                    } else {
                        $('#toast1').toast('show');
                    }
                }
            }
            youCanChangeColor = true;
        });

        changeColor = (color) => {
            if (youCanChangeColor === true) {
                if (color != tempColor) {
                    myMap.geoObjects.remove(tempRoute);
                    tempRoute = new ymaps.Polyline(fullCoord, {}, {
                        strokeColor: color,
                        strokeOpacity: 0.6,
                        strokeWidth: width,
                        fillColor: color,
                        fillOpacity: 0.3,
                        hintLayout: HintLayout
                    });
                    myMap.geoObjects.add(tempRoute);
                    tempColor = color;
                }
            }
        };


        $('#cancelRouteInfo').on('click', function () {
            getRoutesFromArea(width);
        });

    }
);


let geoObject;
let coordinates;
let getRoutesFromArea;
let colorRoute;
let width = 8;
let fullCoord = [];
let tempColor;
let tempRoute;
let newParseRouteAndDraw = false;
let arrIndexInArea = [];
let arrNeedIndex = [];
let youHaveOtherZoom = false;

function buttCancelClick() {
    if (fullCoord.length == 0) {
        $('#hlpbtn').prop('checked', false);
        $('#onlyForPaintRoute').css("display", "none");
    } else {
        fullCoord = [];
        myMap.geoObjects.remove(tempRoute);
        // getRoutesFromArea(width);
    }
}

function btnFinishClick() {
    if (fullCoord.length == 0) {
        $('#toast2').toast('show');
    } else {
        $('#myModal').modal('show');
    }
}
