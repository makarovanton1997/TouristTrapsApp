package com.netcracker.controller;

import com.netcracker.db.entity.Review;
import com.netcracker.db.entity.Route;
import com.netcracker.db.entity.User;
import com.netcracker.db.service.ReviewsService;
import com.netcracker.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Set;


@RestController
@RequestMapping(value = "/reviews")
public class ReviewsController {
    @Autowired
    private ReviewsService reviewsService;

    @GetMapping(name ="/findAllReviews", value = "")
    public List<Review> findAllReviews() {
        return reviewsService.findAllReviews();
    }

    @GetMapping(name = "/findReviewByID", value = "reviewID/{reviewID}")
    public Review findReviewByID(@PathVariable Integer reviewID) {
        Review review = reviewsService.findReviewByID(reviewID);
        if (review == null) {
            throw new NotFoundException();
        }
        else return review;
    }

    @GetMapping(name = "/findReviewByRouteID", value = "/{routeID}")
    public Page<Review> findReviewByRouteID(@PathVariable Integer routeID, @PageableDefault Pageable pageable) {
        Page<Review> review = reviewsService.findReviewsByRouteID(routeID,pageable);
        if (review == null) {
            throw new NotFoundException();
        }
        else return review;
    }

    @GetMapping(name = "/findReviewByRouteID", value = "/findByRouteID/{routeID}")
    public List<Review> findReviewByRouteID(@PathVariable Integer routeID) {
        List<Review> review = reviewsService.findReviewsByRouteID(routeID);
        if (review == null) {
            throw new NotFoundException();
        }
        else return review;
    }


    @GetMapping(name="/findReviewByRouteIDAndUserID", value="/{routeID}/{userID}")
    public List<Review> findReviewByRouteIDAndUserID(@PathVariable Integer routeID, @PathVariable String userID) {
        return reviewsService.findReviewsByUserIDAndRouteID(userID, routeID);
    }

    @PostMapping(name = "/createReview",value = "/addReview")
    public Review createReview(@RequestParam String userID, @RequestParam Integer routeID,
                               @RequestParam Double routeMark, @RequestParam String reviewText,
                               @AuthenticationPrincipal User user) {
        if (user ==null|| user.equals("") ){
            return null;
        } else {
            return reviewsService.createOrUpdateReview(new Review(routeMark, reviewText, userID, routeID));
        }
    }

    @PutMapping(name ="/updateReviewByID", value = "/updateReview/{reviewID}")
    public Review updateReviewByID(@PathVariable Integer reviewID, @RequestParam Double routeMark, @RequestParam String reviewText,
                                   @AuthenticationPrincipal User user) {

        String userID = user.getUserID();
        Set<Review> reviews = user.getReviews();

        boolean tempReviewID = false;

        for (Review review : reviews) {
            if (review.getReviewID() == reviewID) {
                tempReviewID = true;
            }
        }

        if ((userID == null || userID.equals("")) && (reviews.size() == 0 || tempReviewID == false)) {
            throw new NullPointerException();
        } else {
            Review review = reviewsService.updateReviewByID(reviewID, new Review(routeMark, reviewText));
            return review;
        }
    }

    @DeleteMapping(name ="/deleteReviewByID", value = "/deleteReview/{reviewID}")
    public void deleteReviewByID(@PathVariable Integer reviewID, @AuthenticationPrincipal User user) {
        if (reviewsService.findReviewByID(reviewID) == null) {
            throw new NotFoundException();
        } else {
            String userID = user.getUserID();
            Set<Review> reviews = user.getReviews();

            boolean tempReviewID = false;

            for (Review review : reviews) {
                if (review.getReviewID() == reviewID) {
                    tempReviewID = true;
                }
            }

            if ((userID == null || userID.equals("")) && (reviews.size() == 0 || tempReviewID == false)) {
                throw new NullPointerException();
            } else {
                reviewsService.deleteReviewByID(reviewID);
            }
        }
    }

    @GetMapping(name ="getAverageRouteMark", value = "/{routeID}/getMark")
    public Double getAverageRouteMark(@PathVariable Integer routeID, @PageableDefault Pageable pageable) {
        if (reviewsService.findReviewsByRouteID(routeID,pageable) == null) {
            throw new NotFoundException();
        }
        return reviewsService.getAverageRouteMark(routeID);
    }
}

