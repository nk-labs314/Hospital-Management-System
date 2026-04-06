package com.hospital.e2e;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

class HmsSeleniumTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private final String baseUrl = "http://localhost:3000";

    @BeforeEach
    void setup() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        driver.manage().window().maximize();
    }

    @AfterEach
    void teardown() {
        if (driver != null) driver.quit();
    }

    private void login(String email, String password) {
        driver.get(baseUrl + "/login");

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@type='email']"))).sendKeys(email);
        driver.findElement(By.xpath("//input[@type='password']")).sendKeys(password);
        driver.findElement(By.xpath("//button[contains(.,'Sign In')]")).click();
    }

    @Test
    void validAdminLogin() {
        login("admin@hospital.com", "Admin@123");
        wait.until(ExpectedConditions.urlContains("/admin"));
        assertTrue(driver.getCurrentUrl().contains("/admin"));
    }

    @Test
    void invalidLoginShowsError() {
        login("admin@hospital.com", "wrong123");
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(.,'Invalid email or password') or contains(.,'Invalid credentials')]")
        ));
        assertTrue(driver.getPageSource().contains("Invalid"));
    }

    @Test
    void unauthorizedDashboardRedirectsToWelcome() {
        driver.get(baseUrl + "/dashboard");
        wait.until(ExpectedConditions.urlContains("/welcome"));
        assertTrue(driver.getCurrentUrl().contains("/welcome"));
    }

    @Test
    void logoutRedirectsToWelcome() {
        login("admin@hospital.com", "Admin@123");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".logout-btn"))).click();
        wait.until(ExpectedConditions.urlContains("/welcome"));
        assertTrue(driver.getCurrentUrl().contains("/welcome"));
    }
    @Disabled("Flaky E2E test - depends on dynamic slot availability")
    @Test
    void patientRegistrationAndBookingFlow() {
        String email = "patient_" + UUID.randomUUID() + "@test.com";

        driver.get(baseUrl + "/register?role=patient");

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@placeholder='John']"))).sendKeys("Test");
        driver.findElement(By.xpath("//input[@placeholder='Doe']")).sendKeys("Patient");
        driver.findElement(By.xpath("//input[@placeholder='you@example.com']")).sendKeys(email);
        driver.findElement(By.xpath("//input[@placeholder='Minimum 6 characters']")).sendKeys("Test@123");

        driver.findElement(By.xpath("//button[contains(.,'Create Patient Account')]")).click();

        wait.until(ExpectedConditions.urlContains("/dashboard"));

        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("a[href='/book']"))).click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".dept-tile"))).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".doctor-tile"))).click();

        LocalDate bookingDate = nextWorkingDay();
        WebElement dateInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[type='date']")));
        dateInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        dateInput.sendKeys(Keys.BACK_SPACE);
        dateInput.sendKeys(bookingDate.toString());

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button.slot-pill:not(.booked):not(:disabled)"))).click();

        driver.findElement(By.xpath("//input[@placeholder='e.g. Chest pain, routine check-up...']")).sendKeys("Routine check-up");
        driver.findElement(By.xpath("//button[contains(.,'Continue')]")).click();
        driver.findElement(By.xpath("//button[contains(.,'Confirm Appointment')]")).click();

        wait.until(ExpectedConditions.urlContains("/appointments"));
        assertTrue(driver.getCurrentUrl().contains("/appointments"));
    }

    private LocalDate nextWorkingDay() {
        LocalDate d = LocalDate.now().plusDays(1);
        while (d.getDayOfWeek() == DayOfWeek.SUNDAY) {
            d = d.plusDays(1);
        }
        return d;
    }
}