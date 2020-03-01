package com.netcracker.controller;

import com.google.gson.Gson;
import com.netcracker.db.entity.*;
import com.netcracker.db.service.PhotosService;
import com.netcracker.db.service.RoutesService;
import com.netcracker.db.service.UsersService;
import com.netcracker.exception.InvalidFormException;
import com.netcracker.exception.NotFoundException;
import com.netcracker.util.DataDeserializator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;


@RestController

@SessionAttributes("userID")
@RequestMapping(value = "/routes")
public class RoutesController {
    @Autowired
    private RoutesService routesService;

    @Autowired
    private UsersService usersService;

    @Autowired
    private PhotosService photosService;

    @GetMapping(name ="/findAllRoutes", value = "")
    public List<Route> findAllRoutes() {
        return routesService.findAllRoutes();
    }

    @GetMapping(name = "/findRouteByID", value = "/{routeID}")
    public Route findRouteByID(@PathVariable Integer routeID) {
        Route route = routesService.findRouteByID(routeID);
        if (route == null) {
            throw new NotFoundException();
        }
        else return route;
    }

    @GetMapping(name="/findByUserID", value="findByUserIDAndRouteID/{userID}/{routeID}")
    public Route findRoutesByUserID(@PathVariable String userID, @PathVariable Integer routeID) {
        return routesService.findRouteByUserIDAndRouteID(userID,routeID);
    }

    @GetMapping(name ="/findRoutesInTheArea", value = "/findRoutesInTheArea")
    public List<Route> findRoutesInTheArea(@RequestParam Double southWestX, @RequestParam Double southWestY,
                                           @RequestParam Double northEastX, @RequestParam Double northEastY) {


        return routesService.findRoutesInTheArea(southWestX, southWestY, northEastX, northEastY);
    }

    @PostMapping(name = "/createRoute",value = "/createRoute")
    public void createRoute(@RequestParam String route, HttpServletRequest request, HttpSession session,@AuthenticationPrincipal User user) {


        DataDeserializator dataDeserializator = new Gson().fromJson(route,DataDeserializator.class);

        List<Point> allPoints = new ArrayList<>();
        for( int i = 0; i< dataDeserializator.points.size(); i++){
            double x = dataDeserializator.points.get(i).get(0);
            double y = dataDeserializator.points.get(i).get(1);
            allPoints.add(new Point(x,y));
        }

        String message;

        if (validForm(dataDeserializator.routeName,dataDeserializator.routeShortDescription,
                dataDeserializator.routeFullDescription) == false){

            message = "Forbidden !";
            throw new InvalidFormException(message);
        } else {

            String userID = user.getUserID();

            if (userID == null || userID.equals("") || user==null) {
                throw new NullPointerException();
            } else {

                Route route1 = new Route(dataDeserializator.routeName,
                        dataDeserializator.routeShortDescription, dataDeserializator.routeFullDescription, allPoints,
                        dataDeserializator.color, dataDeserializator.userID);

                routesService.createOrUpdateRoute(route1);
                session.setAttribute("routeIdd", route1.getRouteID());
                session.setAttribute("userID", route1.getUserID());

                routesService.createOrUpdateRoute(route1);
            }
        }
    }

    @PutMapping(name ="/updateRouteByID", value = "/{routeID}/updateRoute")
    public void updateRouteByID(@PathVariable Integer routeID, @RequestParam String routeName,
                                  @RequestParam String routeShortDescription, @RequestParam String routeFullDescription,
                                  @AuthenticationPrincipal User user) {
        String message;

        if (validForm(routeName,routeShortDescription,routeFullDescription) == false){

            message = "Forbidden !";
            throw new InvalidFormException(message);
        } else {

            String userID = user.getUserID();
            Set<Route> routes = user.getRoutes();

            boolean tempRouteID = false;

            for (Route route : routes) {
                if(route.getRouteID()==routeID){
                    tempRouteID=true;
                }
            }

            if ((userID ==null|| userID.equals("") ) && (routes.size()==0 || tempRouteID==false)){
                throw new NullPointerException();
            } else {
                routesService.updateRouteByID(routeID, routeName, routeShortDescription, routeFullDescription);
            }
        }
    }

    @DeleteMapping(name ="/deleteRouteByID", value = "/{routeID}")
    public void deleteRouteByID(@PathVariable Integer routeID, @AuthenticationPrincipal User user) {
        if (routesService.findRouteByID(routeID) == null) {
            throw new NotFoundException();
        }
        else {

            String userID = user.getUserID();
            Set<Route> routes = user.getRoutes();

            boolean tempRouteID = false;

            for (Route route : routes) {
                if (route.getRouteID() == routeID) {
                    tempRouteID = true;
                }
            }

            if ((userID == null || userID.equals("")) && (routes.size() == 0 || tempRouteID == false)) {
                throw new NullPointerException();
            } else {

                routesService.deleteRouteByID(routeID);
            }
        }
    }

    @PutMapping(name ="/addReviewToRoute", value = "/{routeID}/addReview")
    public void addReviewToRoute(@PathVariable Integer routeID, @RequestParam String reviewText, @RequestParam String userID,
                                 @RequestParam Double routeMark) {
        if (routesService.findRouteByID(routeID) == null) {
            throw new NotFoundException();
        }
        else routesService.addReviewToRoute(routeID, new Review(routeMark,userID, reviewText));
    }

    @PutMapping(name ="/addPointToRoute", value = "/{routeID}/addPoint")
    public void addPointToRoute(@PathVariable Integer routeID, @RequestBody Point point) {
        if (routesService.findRouteByID(routeID) == null) {
            throw new NotFoundException();
        }
        else routesService.addPointToRoute(routeID, point);
    }

    @PutMapping(name ="/addPhotoToRoute", value = "/{routeID}/addPhoto")
    public void addPhotoToRoute(@PathVariable Integer routeID, @RequestBody Photo photo) {
        if (routesService.findRouteByID(routeID) == null) {
            throw new NotFoundException();
        }
        else routesService.addPhotoToRoute(routeID, photo);
    }

    @GetMapping(name = "/getRouteMark", value = "/{routeID}/getMark")
    public Double getRouteMark(@PathVariable Integer routeID) {
        return routesService.getRouteMarkByRouteID(routeID);
    }

    public boolean validForm(String string1,String string2, String string3) {
        boolean valid = true;
        char [] char1 = string1.toCharArray();
        char [] char2 = string2.toCharArray();
        char [] char3 = string3.toCharArray();

        if (char1[0]==' ' || char2[0]==' ' || char3[0]==' ' ||
            char1.length <3 || char2.length <3 || char3.length <3){
            valid = false;
        }

        return valid;
    }
}
