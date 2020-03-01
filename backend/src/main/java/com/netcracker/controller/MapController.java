package com.netcracker.controller;

import com.netcracker.db.entity.Photo;
import com.netcracker.db.entity.User;
import com.netcracker.db.service.PhotosService;
import com.netcracker.db.service.RoutesService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Controller
@SessionAttributes("routeIdd")
public class MapController {
//зайдите в appproperties и пропишите свой путь до папки uploads
    @Value("${upload.path}")
    private String UPLOADED_FOLDER;

    @Autowired
    private PhotosService photosService;

    @Autowired
    private RoutesService routeService;


    private JSONObject getSuccessMessage() {
        JSONObject jsonObject = null;
        try {
            jsonObject = new JSONObject();
            jsonObject.put("0", "{\"success\":true}");
        } catch (Exception e) {
            e.printStackTrace();
        }
        return jsonObject;
    }

    @GetMapping("/")
    public String ourPage(Model model ,@AuthenticationPrincipal User user ) {
        Map<String, Object> data = new HashMap<>();

        data.put("user", user);

        model.addAttribute("signInData", data);

        return "ourPage";
    }


    @RequestMapping(value = "/{qquuid}",
            method = {RequestMethod.DELETE})
    public @ResponseBody
    Object uploadDelete(
            HttpServletRequest request,
            @PathVariable("qquuid") String qquuid) {
        System.out.println("uploadDelete() called");
        String fileName = (String) request.getSession()
                .getAttribute(qquuid);
        try {
            if (fileName != null) {
                Path path = Paths
                        .get(UPLOADED_FOLDER + fileName);
                Files.delete(path);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return getSuccessMessage().toString();
    }

    @RequestMapping(value = "/",
            method = {RequestMethod.POST})
    public @ResponseBody
    Object upload(
            @RequestParam("file") MultipartFile file,
            ModelMap model,
            HttpServletRequest request ,
            HttpSession session) {
        System.out.println("upload() called");
        String photoName = "";
        String pathToPhoto = "";
        Integer routeID = 1;
        //Photo photo = new Photo(routeID, photoName, photoDescription, pathToPhoto);

        Map<String, Object> data = new HashMap<>();

        if (file.isEmpty()) {
            request.setAttribute("message",
                    "Please select a file to upload");
            return "uploadStatus";
        }

        try {
            String qquuid = request.getParameter("qquuid");
            System.out.println("qquuid=" + qquuid);
            if (qquuid != null) {
                request.getSession().setAttribute(qquuid,
                        file.getOriginalFilename());
            }


            byte[] bytes = file.getBytes();
            Path path = Paths.get(UPLOADED_FOLDER
                    + file.getOriginalFilename());
            // Files.write(path, bytes);

            String uuidFile = UUID.randomUUID().toString();
            String resultFilename = uuidFile + file.getOriginalFilename();
            file.transferTo(new File(UPLOADED_FOLDER + "/" + resultFilename));

          //  request.setAttribute("message",
              //      "You have successfully uploaded '"
                 //           + file.getOriginalFilename() + "'");

            Integer routeID1 = (Integer) session.getAttribute("routeIdd");
            System.out.println("RouteIdPhoto=" + routeID1);
            Photo photo = new Photo(routeID1, photoName, pathToPhoto);
            photo.setRouteID(routeID1);
            session.removeAttribute("routeIdd");
            photo.setPhotoName(resultFilename);
            photo.setPathToPhoto(UPLOADED_FOLDER);
            photosService.createOrUpdatePhoto(photo);



        } catch (IOException e) {
            e.printStackTrace();
        }


        return getSuccessMessage().toString();
    }

    @RequestMapping("/BootstrapFileInput")
    public String bootstrapFileInput(Map<String, Object> model) {
        System.out.println("BootstrapFileInput() called");
        return "BootstrapFileInput";
    }

    @RequestMapping("/Dropzone")
    public String dropzone(Map<String, Object> model) {
        System.out.println("Dropzone() called");
        return "Dropzone";
    }

}
