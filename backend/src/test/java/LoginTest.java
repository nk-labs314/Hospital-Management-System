import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.time.Duration;

public class LoginTest {

    static WebDriver driver;
    static WebDriverWait wait;

    public static void setup() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("http://localhost:3000/login");
    }

    public static void teardown() {
        driver.quit();
    }

    // ✅ Test 1: Valid Login
    public static void testValidLogin() {

        WebElement email = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@type='email']"))
        );
        email.clear();
        email.sendKeys("admin@hospital.com");

        WebElement password = driver.findElement(By.xpath("//input[@type='password']"));
        password.clear();
        password.sendKeys("Admin@123");

        driver.findElement(By.xpath("//button[contains(text(),'Sign In')]")).click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[contains(text(),'Sign Out')]")
        ));

        System.out.println("✅ Valid Login Test Passed");
    }

    // ❌ Test 2: Invalid Password
    public static void testInvalidPassword() {

        driver.get("http://localhost:3000/login");

        driver.findElement(By.xpath("//input[@type='email']"))
                .sendKeys("admin@hospital.com");

        driver.findElement(By.xpath("//input[@type='password']"))
                .sendKeys("wrong123");

        driver.findElement(By.xpath("//button[contains(text(),'Sign In')]")).click();

        try {
            wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[contains(text(),'Invalid email or password')]")
            ));
            System.out.println("✅ Invalid Password Test Passed");
        } catch (Exception e) {
            System.out.println("❌ Invalid Password Test Failed");
        }
    }

    // ❌ Test 3: Empty Fields
    public static void testEmptyFields() {

        driver.get("http://localhost:3000/login");

        driver.findElement(By.xpath("//button[contains(text(),'Sign In')]")).click();

        if (driver.getPageSource().toLowerCase().contains("required")) {
            System.out.println("✅ Empty Fields Test Passed");
        } else {
            System.out.println("❌ Empty Fields Test Failed");
        }
    }
    public static void testBookAppointment() {

        driver.get("http://localhost:3000/login?role=patient");

        driver.findElement(By.xpath("//input[@type='email']"))
                .sendKeys("test@gmail.com");

        driver.findElement(By.xpath("//input[@type='password']"))
                .sendKeys("123456");

        driver.findElement(By.xpath("//button[contains(text(),'Sign In')]")).click();

        // Navigate to booking page
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//a[contains(@href,'book')]")
        )).click();

        // Select department (adjust if needed)
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class,'department')]")
        )).click();

        // Select doctor
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class,'doctor')]")
        )).click();

        // Select slot
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class,'slot')]")
        )).click();

        // Confirm booking
        driver.findElement(By.xpath("//button[contains(text(),'Confirm')]")).click();

        if (driver.getPageSource().contains("confirmed")) {
            System.out.println("✅ Booking Test Passed");
        } else {
            System.out.println("❌ Booking Test Failed");
        }
    }

    public static void testDoubleBooking() {

        driver.get("http://localhost:3000/login?role=patient");

        driver.findElement(By.xpath("//input[@type='email']"))
                .sendKeys("test@gmail.com");

        driver.findElement(By.xpath("//input[@type='password']"))
                .sendKeys("123456");

        driver.findElement(By.xpath("//button[contains(text(),'Sign In')]")).click();

        // Go to booking
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//a[contains(@href,'book')]")
        )).click();

        // Select same slot twice
        WebElement slot = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class,'slot')]")
        ));

        slot.click();
        driver.findElement(By.xpath("//button[contains(text(),'Confirm')]")).click();

        // Try again same slot
        slot.click();
        driver.findElement(By.xpath("//button[contains(text(),'Confirm')]")).click();

        if (driver.getPageSource().toLowerCase().contains("not available")) {
            System.out.println("✅ Double Booking Test Passed");
        } else {
            System.out.println("❌ Double Booking Test Failed");
        }
    }
    public static void testNavigateAppointments() {

        driver.get("http://localhost:3000/login");

        driver.findElement(By.xpath("//input[@type='email']"))
                .sendKeys("admin@hospital.com");

        driver.findElement(By.xpath("//input[@type='password']"))
                .sendKeys("Admin@123");

        driver.findElement(By.xpath("//button[contains(text(),'Sign In')]")).click();

        wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("a[href='/admin/appointments']")
        )).click();

        if (driver.getCurrentUrl().contains("/admin/appointments")) {
            System.out.println("✅ Navigation Test Passed");
        } else {
            System.out.println("❌ Navigation Test Failed");
        }
    }
    public static void testLogout() {

        driver.get("http://localhost:3000/login");

        driver.findElement(By.xpath("//input[@type='email']"))
                .sendKeys("admin@hospital.com");

        driver.findElement(By.xpath("//input[@type='password']"))
                .sendKeys("Admin@123");

        driver.findElement(By.xpath("//button[contains(text(),'Sign In')]")).click();

        // Click logout
        wait.until(ExpectedConditions.elementToBeClickable(
                By.className("logout-btn")
        )).click();

        if (driver.getCurrentUrl().contains("welcome")) {
            System.out.println("✅ Logout Test Passed");
        } else {
            System.out.println("❌ Logout Test Failed");
        }
    }

    public static void testUnauthorizedAccess() {

        driver.get("http://localhost:3000/dashboard");

        if (driver.getCurrentUrl().contains("welcome")) {
            System.out.println("✅ Unauthorized Access Test Passed");
        } else {
            System.out.println("❌ Unauthorized Access Test Failed");
        }
    }
    public static void main(String[] args) {

        setup();

        testValidLogin();
        testInvalidPassword();
        testEmptyFields();
        testLogout();
        testUnauthorizedAccess();
        testNavigateAppointments();

        testBookAppointment();


        teardown();
    }
}